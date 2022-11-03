import { Signer, DID } from '@ucanto/interface'
import { CAR } from '@ucanto/transport'
import { parse } from '@ipld/dag-ucan/did'
import { add as storeAdd } from '@web3-storage/access/capabilities/store'
import { add as uploadAdd } from '@web3-storage/access/capabilities/upload'
import { connection } from '@web3-storage/access'
import retry, { AbortError } from 'p-retry'
import { CID } from 'multiformats/cid'
import Queue from 'p-queue'
import { collect } from './utils'

export * from './unixfs'
export * from './sharding'
export { BlockMemoStream } from './utils'

// Production
const serviceURL = new URL('https://8609r1772a.execute-api.us-east-1.amazonaws.com')
const serviceDID = parse('did:key:z6MkrZ1r5XBFZjBU34qyD8fueMbMRkKw17BZaq2ivKFjnz2z')

const RETRIES = 3
const CONCURRENT_UPLOADS = 3

export interface Retryable {
  retries?: number
}

export interface CARMeta {
  /**
   * CID of the CAR file (not the data it contains).
   */
  cid: CID
  /**
   * Size of the CAR file in bytes.
   */
  size: number
}

export type CARData = AsyncIterable<Uint8Array>

/**
 * Upload multiple DAG shards (encoded as CAR files) to the service.
 *
 * Note: an "upload" must be registered in order to link multiple shards
 * together as a complete upload.
 *
 * The writeable side of this transform stream accepts CAR files and the
 * readable side yields `CARMeta`.
 */
export class ShardStoringStream extends TransformStream<CARData, CARMeta> {
  /**
   * @param receiver The receiver of the stored item. Usually the DID of the account.
   * @param signer Signing authority. Usually the user agent.
   */
  constructor (receiver: DID, signer: Signer, options: Retryable = {}) {
    const queue = new Queue({ concurrency: CONCURRENT_UPLOADS })
    const abortController = new AbortController()
    super({
      async transform (chunk, controller) {
        void queue.add(async () => {
          try {
            const data = await collect(chunk)
            const bytes = new Uint8Array(await new Blob(data).arrayBuffer())
            const cid = await storeDAG(receiver, signer, bytes, options)
            controller.enqueue({ cid, size: bytes.length })
          } catch (err) {
            controller.error(err)
            abortController.abort(err)
          }
        }, { signal: abortController.signal })

        // retain backpressure by not returning until no items queued to be run
        await queue.onSizeLessThan(1)
      },
      async flush () {
        // wait for queue empty AND running items complete
        await queue.onIdle()
      }
    })
  }
}

/**
 * Register an "upload" with the service.
 *
 * @param receiver The receiver of the upload registration. Usually the DID of the account.
 * @param signer Signing authority. Usually the user agent.
 * @param root Root data CID for the DAG that was stored.
 * @param shards CIDs of CAR files that contain the DAG.
 */
export async function registerUpload (receiver: DID, signer: Signer, root: CID, shards: CID[], options: Retryable = {}): Promise<void> {
  const conn = connection(serviceDID, fetch.bind(globalThis), serviceURL)
  await retry(async () => {
    const result = await uploadAdd.invoke({
      issuer: signer,
      audience: serviceDID,
      with: receiver,
      // @ts-expect-error
      caveats: { root, shards }
    // @ts-expect-error
    }).execute(conn)
    if (result?.error === true) throw result
  }, { onFailedAttempt: console.warn, retries: options.retries ?? RETRIES })
}

/**
 * Store a DAG encoded as a CAR file.
 *
 * @param receiver The receiver of the stored item. Usually the DID of the account.
 * @param signer Signing authority. Usually the user agent.
 * @param bytes CAR file bytes.
 */
export async function storeDAG (receiver: DID, signer: Signer, bytes: Uint8Array, options: Retryable = {}): Promise<CID> {
  const link = await CAR.codec.link(bytes)
  const conn = connection(serviceDID, fetch.bind(globalThis), serviceURL)
  const result = await retry(async () => {
    const res = await storeAdd.invoke({
      issuer: signer,
      audience: serviceDID,
      with: receiver,
      // @ts-expect-error
      caveats: { link }
    // @ts-expect-error
    }).execute(conn)
    return res
  }, { onFailedAttempt: console.warn, retries: options.retries ?? RETRIES })

  // Return early if it was already uploaded.
  if (result.status === 'done') {
    // @ts-expect-error
    return link
  }

  if (result.error != null) {
    // @ts-expect-error not cause yet
    throw new Error('failed store/add invocation', { cause: result.error })
  }

  const res = await retry(async () => {
    const res = await fetch(result.url, {
      method: 'PUT',
      mode: 'cors',
      body: bytes,
      headers: result.headers
    })
    if (res.status >= 400 && res.status < 500) {
      throw new AbortError(`upload failed: ${res.status}`)
    }
    return res
  }, { onFailedAttempt: console.warn, retries: options.retries ?? RETRIES })

  if (!res.ok) {
    throw new Error('upload failed')
  }

  // @ts-expect-error
  return link
}

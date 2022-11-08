import { connect } from '@ucanto/client'
import { Signer, DID, ServiceMethod } from '@ucanto/interface'
import { CAR, CBOR, HTTP } from '@ucanto/transport'
import { parse } from '@ipld/dag-ucan/did'
import { add as storeAdd } from '@web3-storage/access/capabilities/store'
import { add as uploadAdd } from '@web3-storage/access/capabilities/upload'
import { UploadAdd, StoreAdd } from '@web3-storage/access/capabilities/types'
import retry, { AbortError } from 'p-retry'
import { UnknownLink } from 'multiformats/link'
import Queue from 'p-queue'
import { CARFile, CARMetadata, CARLink, Abortable, Retryable } from './types'

export * from './unixfs'
export * from './sharding'
export * from './types'

// Production
const serviceURL = new URL('https://8609r1772a.execute-api.us-east-1.amazonaws.com')
const serviceDID = parse('did:key:z6MkrZ1r5XBFZjBU34qyD8fueMbMRkKw17BZaq2ivKFjnz2z')

interface Service {
  store: { add: ServiceMethod<StoreAdd, StoreAddResponse, never> }
  upload: { add: ServiceMethod<UploadAdd, null, never> }
}

interface StoreAddResponse {
  status: string
  headers: Record<string, string>
  url: string
}

const RETRIES = 3
const CONCURRENT_UPLOADS = 3

/**
 * Upload multiple DAG shards (encoded as CAR files) to the service.
 *
 * Note: an "upload" must be registered in order to link multiple shards
 * together as a complete upload.
 *
 * The writeable side of this transform stream accepts CAR files and the
 * readable side yields `CARMetadata`.
 */
export class ShardStoringStream extends TransformStream<CARFile, CARMetadata> {
  /**
   * @param account DID of the account that is receiving the upload.
   * @param signer Signing authority. Usually the user agent.
   */
  constructor (account: DID, signer: Signer, options: Retryable = {}) {
    const queue = new Queue({ concurrency: CONCURRENT_UPLOADS })
    const abortController = new AbortController()
    super({
      async transform (car, controller) {
        void queue.add(async () => {
          try {
            const opts = { ...options, signal: abortController.signal }
            const cid = await storeDAG(account, signer, car, opts)
            const { version, roots } = car
            controller.enqueue({ version, roots, cid, size: car.size })
          } catch (err) {
            controller.error(err)
            abortController.abort(err)
          }
        }, { signal: abortController.signal })

        // retain backpressure by not returning until no items queued to be run
        await queue.onSizeLessThan(1)
      },
      async flush () {
        // wait for queue empty AND pending items complete
        await queue.onIdle()
      }
    })
  }
}

/**
 * Register an "upload" with the service.
 *
 * @param account DID of the account that is receiving the upload.
 * @param signer Signing authority. Usually the user agent.
 * @param root Root data CID for the DAG that was stored.
 * @param shards CIDs of CAR files that contain the DAG.
 */
export async function registerUpload (account: DID, signer: Signer, root: UnknownLink, shards: CARLink[], options: Retryable & Abortable = {}): Promise<void> {
  const conn = connect<Service>({
    id: serviceDID,
    encoder: CAR,
    decoder: CBOR,
    channel: HTTP.open({
      url: serviceURL,
      method: 'POST'
    })
  })
  await retry(async () => {
    const result = await uploadAdd.invoke({
      issuer: signer,
      audience: serviceDID,
      with: account,
      nb: { root, shards }
    }).execute(conn)
    if (result?.error === true) throw result
  }, { onFailedAttempt: console.warn, retries: options.retries ?? RETRIES })
}

/**
 * Store a DAG encoded as a CAR file.
 *
 * @param account DID of the account that is receiving the upload.
 * @param signer Signing authority. Usually the user agent.
 * @param car CAR file data.
 */
export async function storeDAG (account: DID, signer: Signer, car: Blob, options: Retryable & Abortable = {}): Promise<CARLink> {
  // TODO: validate blob contains CAR data
  const bytes = new Uint8Array(await car.arrayBuffer())
  const link = await CAR.codec.link(bytes)
  const conn = connect<Service>({
    id: serviceDID,
    encoder: CAR,
    decoder: CBOR,
    channel: HTTP.open({
      url: serviceURL,
      method: 'POST'
    })
  })
  const result = await retry(async () => {
    const res = await storeAdd.invoke({
      issuer: signer,
      audience: serviceDID,
      with: account,
      nb: { link }
    }).execute(conn)
    return res
  }, { onFailedAttempt: console.warn, retries: options.retries ?? RETRIES })

  if (result.error != null) {
    // @ts-expect-error not cause yet
    throw new Error('failed store/add invocation', { cause: result })
  }

  // Return early if it was already uploaded.
  if (result.status === 'done') {
    return link
  }

  const res = await retry(async () => {
    try {
      const res = await fetch(result.url, {
        method: 'PUT',
        mode: 'cors',
        body: car,
        headers: result.headers,
        signal: options.signal
      })
      if (res.status >= 400 && res.status < 500) {
        throw new AbortError(`upload failed: ${res.status}`)
      }
      return res
    } catch (err) {
      if (options.signal?.aborted === true) {
        throw new AbortError('upload aborted')
      }
      throw err
    }
  }, { onFailedAttempt: console.warn, retries: options.retries ?? RETRIES })

  if (!res.ok) {
    throw new Error('upload failed')
  }

  return link
}

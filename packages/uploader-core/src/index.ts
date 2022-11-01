import { Signer, DID } from '@ucanto/interface'
import { CAR } from '@ucanto/transport'
import { parse } from '@ipld/dag-ucan/did'
import { add as storeAdd } from '@web3-storage/access/capabilities/store'
import { add as uploadAdd } from '@web3-storage/access/capabilities/upload'
import { connection } from '@web3-storage/access/connection'
import retry, { AbortError } from 'p-retry'
import { CID } from 'multiformats/cid'
import { transform, collect } from 'streaming-iterables'
import { toIterable } from './utils'

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

export interface ShardMeta {
  /**
   * CID of the CAR file (not the data it contains).
   */
  cid: CID
  /**
   * Size of the CAR file in bytes.
   */
  size: number
}

export interface ShardStoredEvent {
  meta: ShardMeta
}

export interface StoreShardsOptions extends Retryable {
  onShardStored?: (event: ShardStoredEvent) => void
}

export type CarData = AsyncIterable<Uint8Array>

/**
 * Upload multiple DAG shards (encoded as CAR files) to the service.
 *
 * Note: an "upload" must be registered in order to link multiple shards
 * together as a complete upload.
 *
 * @param receiver The receiver of the stored item. Usually the DID of the account.
 * @param signer Signing authority. Usually the user agent.
 * @param shards DAG shards encoded as CAR files.
 */
export async function storeDAGShards (receiver: DID, signer: Signer, shards: ReadableStream<CarData>, options: StoreShardsOptions = {}): Promise<CID[]> {
  const onShardStored = options.onShardStored ?? (() => {})

  const uploads = transform(CONCURRENT_UPLOADS, async shard => {
    const shards = await collect(shard)
    const bytes = new Uint8Array(await new Blob(shards).arrayBuffer())
    const cid = await storeDAG(receiver, signer, bytes, options)
    onShardStored({ meta: { cid, size: bytes.length } })
    return cid
  }, toIterable(shards))

  return await collect(uploads)
}

/**
 * Register an "upload" with the service.
 *
 * @param receiver The receiver of the upload registration. Usually the DID of the account.
 * @param signer Signing authority. Usually the user agent.
 * @param root Root data CID for the DAG that was stored.
 * @param shards CIDs of CAR files that contain the DAG.
 */
export async function registerUpload (receiver: DID, signer: Signer, root: CID, shards: CID[]): Promise<void> {
  const conn = connection({
    // @ts-expect-error
    id: serviceDID,
    url: serviceURL
  })
  const result = await uploadAdd.invoke({
    issuer: signer,
    audience: serviceDID,
    with: receiver,
    // @ts-expect-error
    caveats: { root, shards }
  // @ts-expect-error
  }).execute(conn)
  if (result?.error === true) throw result
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
  const conn = connection({
    // @ts-expect-error
    id: serviceDID,
    url: serviceURL
  })
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

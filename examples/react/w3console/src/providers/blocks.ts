import { AnyBlock, BlockFetcher } from '@alanshaw/pail/block'
import { AnyLink } from '@alanshaw/pail/link'
import retry from 'p-retry'

export { MultiBlockFetcher } from '@alanshaw/pail/block'

export type { BlockFetcher }

export interface BlockPutter {
  put (block: AnyBlock): Promise<void>
}

export class MemoryBlockstore implements BlockFetcher, BlockPutter {
  protected _data: Map<string, Uint8Array>

  constructor (blocks: AnyBlock[] = []) {
    this._data = new Map(blocks.map(b => [b.cid.toString(), b.bytes]))
  }

  async get (cid: AnyLink): Promise<AnyBlock|undefined> {
    const bytes = this._data.get(cid.toString())
    if (!bytes) return
    return { cid, bytes }
  }

  async put (block: AnyBlock) {
    this._data.set(block.cid.toString(), block.bytes)
  }
}

export function withCache (fetcher: BlockFetcher, cache: BlockFetcher & BlockPutter) {
  return {
    async get (cid: AnyLink) {
      try {
        const block = await cache.get(cid)
        if (block) return block
      } catch {}
      const block = await fetcher.get(cid)
      if (block) {
        await cache.put(block)
      }
      return block
    }
  }
}

export class GatewayBlockFetcher implements BlockFetcher {
  #url

  constructor (url?: string|URL) {
    this.#url = new URL(url ?? 'https://ipfs.io')
  }

  async get (cid: AnyLink): Promise<AnyBlock|undefined> {
    return await retry(async () => {
      const controller = new AbortController()
      const timeoutID = setTimeout(() => controller.abort(), 10000)
      try {
        const res = await fetch(new URL(`/ipfs/${cid}?format=raw`, this.#url), { signal: controller.signal })
        if (!res.ok) return
        const bytes = new Uint8Array(await res.arrayBuffer())
        return { cid, bytes }
      } catch (err) {
        throw new Error(`failed to fetch block: ${cid}`, { cause: err })
      } finally {
        clearTimeout(timeoutID)
      }
    })
  }
}

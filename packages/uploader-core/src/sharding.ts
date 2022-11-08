import { Block } from '@ipld/unixfs'
import { CarWriter } from '@ipld/car'
import type { Link, Version } from 'multiformats/link'
import type { CARFile } from './types'
import { collect } from './utils'

// most thing are < 30MB
const SHARD_SIZE = 1024 * 1024 * 30

export interface ShardingOptions {
  /**
   * The target shard size. Actual size of CAR output may be bigger due to
   * CAR header and block encoding data.
   */
  shardSize?: number
}

/**
 * Shard a set of blocks into a set of CAR files. The last block is assumed to
 * be the DAG root and becomes the CAR root CID for the last CAR output.
 */
export class ShardingStream extends TransformStream<Block, CARFile> {
  constructor (options: ShardingOptions = {}) {
    const shardSize = options.shardSize ?? SHARD_SIZE
    let shard: Block[] = []
    let readyShard: Block[] | null = null
    let size = 0

    super({
      async transform (block, controller) {
        if (readyShard != null) {
          controller.enqueue(await encodeCAR(readyShard))
          readyShard = null
        }
        if (size + block.bytes.length > shardSize) {
          readyShard = shard
          shard = []
          size = 0
        }
        shard.push(block)
        size += block.bytes.length
      },

      async flush (controller) {
        if (readyShard != null) {
          controller.enqueue(await encodeCAR(readyShard))
        }

        const rootBlock = shard.at(-1)
        if (rootBlock != null) {
          controller.enqueue(await encodeCAR(shard, rootBlock.cid))
        }
      }
    })
  }
}

export async function encodeCAR (blocks: Iterable<Block>|AsyncIterable<Block>, root?: Link<unknown, number, number, Version>): Promise<CARFile> {
  // @ts-expect-error
  const { writer, out } = CarWriter.create(root)
  let error: Error
  void (async () => {
    try {
      for await (const block of blocks) {
        // @ts-expect-error
        await writer.put(block)
      }
    } catch (err: any) {
      error = err
    } finally {
      await writer.close()
    }
  })()
  const chunks = await collect(out)
  // @ts-expect-error
  if (error != null) throw error
  const roots = root != null ? [root] : []
  return Object.assign(new Blob(chunks), { version: 1, roots })
}

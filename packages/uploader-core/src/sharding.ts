import { Block } from '@ipld/unixfs'
import { CarWriter } from '@ipld/car'
import type { Link, Version } from 'multiformats/link'

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
export class ShardingStream extends TransformStream<Block, AsyncIterable<Uint8Array>> {
  constructor (options: ShardingOptions = {}) {
    const shardSize = options.shardSize ?? SHARD_SIZE
    let shard: Block[] = []
    let readyShard: Block[] | null = null
    let size = 0

    super({
      transform (block, controller) {
        if (readyShard != null) {
          controller.enqueue(encodeCAR(readyShard))
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

      flush (controller) {
        if (readyShard != null) {
          controller.enqueue(encodeCAR(readyShard))
        }

        if (shard.length > 0) {
          controller.enqueue(encodeCAR(shard, shard.at(-1)?.cid))
        }
      }
    })
  }
}

export function encodeCAR (blocks: Iterable<Block>, root?: Link<unknown, number, number, Version>): AsyncIterable<Uint8Array> {
  // @ts-expect-error
  const { writer, out } = CarWriter.create(root)
  void (async () => {
    for (const block of blocks) {
      // @ts-expect-error https://github.com/ipld/js-unixfs/issues/30
      await writer.put(block)
    }
    await writer.close()
  })()
  return out
}

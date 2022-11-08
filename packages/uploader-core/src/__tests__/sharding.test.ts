import { Blob } from '@web-std/file'
import { randomBytes } from 'crypto'
import { toIterable, collect } from '../utils'
import { createFileEncoderStream } from '../unixfs'
import { ShardingStream } from '../sharding'

describe('sharding', () => {
  it('creates shards from blocks', async () => {
    const bytes = randomBytes(1024 * 1024)
    const file = new Blob([bytes])
    const shardSize = 512 * 1024

    const fileStream = createFileEncoderStream(file)
    const shardingStream = new ShardingStream({ shardSize })
    const shards = await collect(toIterable(fileStream.pipeThrough(shardingStream)))

    expect(shards.length).toBeGreaterThan(1)

    for (const car of shards) {
      // add 100 bytes leeway to the chunk size for encoded CAR data
      expect(car.size).toBeLessThanOrEqual(shardSize + 100)
    }
  })
})

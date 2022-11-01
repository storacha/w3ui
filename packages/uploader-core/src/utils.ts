import { Block } from '@ipld/unixfs'

export class BlockMemoStream extends TransformStream<Block, Block> {
  #memo: Block|undefined

  constructor () {
    super({
      transform: (block, controller) => {
        this.#memo = block
        controller.enqueue(block)
      }
    })
  }

  get memo (): Block|undefined {
    return this.#memo
  }
}

export function toIterable<T> (readable: ReadableStream<T> | NodeJS.ReadableStream): AsyncIterable<T> {
  // @ts-expect-error
  if (readable[Symbol.asyncIterator] != null) return readable

  // Browser ReadableStream
  if ('getReader' in readable) {
    return (async function * () {
      const reader = readable.getReader()

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) return
          yield value
        }
      } finally {
        reader.releaseLock()
      }
    })()
  }

  throw new Error('unknown stream')
}

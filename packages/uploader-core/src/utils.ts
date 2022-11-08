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

export async function collect<T> (collectable: AsyncIterable<T>|Iterable<T>): Promise<T[]> {
  const chunks: T[] = []
  for await (const chunk of collectable) chunks.push(chunk)
  return chunks
}

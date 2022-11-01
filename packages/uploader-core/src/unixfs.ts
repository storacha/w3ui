import * as UnixFS from '@ipld/unixfs'
import type { Block } from '@ipld/unixfs'
import type { Link } from 'multiformats/link'
import * as raw from 'multiformats/codecs/raw'
import { collect } from 'streaming-iterables'
import { toIterable } from './utils'

const queuingStrategy = UnixFS.withCapacity(1048576 * 175)

export interface EncodeResult {
  /**
   * Root CID for the DAG.
   */
  cid: Link<unknown, number, number, 0|1>
  /**
   * Blocks for the generated DAG.
   */
  blocks: Block[]
}

// TODO: configure chunk size and max children https://github.com/ipld/js-unixfs/issues/36
const settings = UnixFS.configure({
  fileChunkEncoder: raw,
  smallFileEncoder: raw
})

export async function encodeFile (blob: Blob): Promise<EncodeResult> {
  const readable = createFileEncoderStream(blob)
  const blocks = await collect(toIterable(readable))
  const rootBlock = blocks.at(-1)
  if (rootBlock == null) throw new Error('missing root block')
  return { cid: rootBlock.cid, blocks }
}

export function createFileEncoderStream (blob: Blob): ReadableStream<Block> {
  const { readable, writable } = new TransformStream<Block, Block>({}, queuingStrategy)
  const unixfsWriter = UnixFS.createWriter({ writable, settings })
  const fileBuilder = new UnixFsFileBuilder(blob)
  void (async () => {
    await fileBuilder.finalize(unixfsWriter)
    await unixfsWriter.close()
  })()
  return readable
}

class UnixFsFileBuilder {
  #file: Blob

  constructor (file: Blob) {
    this.#file = file
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async finalize (writer: UnixFS.View) {
    const unixfsFileWriter = UnixFS.createFileWriter(writer)
    const stream = toIterable<Uint8Array>(this.#file.stream())
    for await (const chunk of stream) {
      await unixfsFileWriter.write(chunk)
    }
    return await unixfsFileWriter.close()
  }
}

class UnixFSDirectoryBuilder {
  entries: Map<string, UnixFsFileBuilder | UnixFSDirectoryBuilder> = new Map()

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  async finalize (writer: UnixFS.View) {
    const dirWriter = UnixFS.createDirectoryWriter(writer)
    for (const [name, entry] of this.entries) {
      const link = await entry.finalize(writer)
      dirWriter.set(name, link)
    }
    return await dirWriter.close()
  }
}

export async function encodeDirectory (files: Iterable<File>): Promise<EncodeResult> {
  const readable = createDirectoryEncoderStream(files)
  const blocks = await collect(toIterable(readable))
  const rootBlock = blocks.at(-1)
  if (rootBlock == null) throw new Error('missing root block')
  return { cid: rootBlock.cid, blocks }
}

export function createDirectoryEncoderStream (files: Iterable<File>): ReadableStream<Block> {
  const rootDir = new UnixFSDirectoryBuilder()

  for (const file of files) {
    const path = file.name.split('/')
    if (path[0] === '' || path[0] === '.') {
      path.shift()
    }
    let dir = rootDir
    for (const [i, name] of path.entries()) {
      if (i === path.length - 1) {
        dir.entries.set(name, new UnixFsFileBuilder(file))
        break
      }
      let dirBuilder = dir.entries.get(name)
      if (dirBuilder == null) {
        dirBuilder = new UnixFSDirectoryBuilder()
        dir.entries.set(name, dirBuilder)
      }
      if (!(dirBuilder instanceof UnixFSDirectoryBuilder)) {
        throw new Error(`"${name}" cannot be a file and a directory`)
      }
      dir = dirBuilder
    }
  }

  const { readable, writable } = new TransformStream<Block, Block>({}, queuingStrategy)
  const unixfsWriter = UnixFS.createWriter({ writable, settings })
  void (async () => {
    await rootDir.finalize(unixfsWriter)
    await unixfsWriter.close()
  })()

  return readable
}

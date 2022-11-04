import { createContext, useContext, createComponent, ParentComponent } from 'solid-js'
import { createStore } from 'solid-js/store'
import {
  createFileEncoderStream,
  createDirectoryEncoderStream,
  BlockMemoStream,
  ShardingStream,
  ShardStoringStream,
  CARMeta,
  CARData,
  CARLink,
  registerUpload
} from '@w3ui/uploader-core'
import { useAuth } from '@w3ui/solid-keyring'
import { Link, Version, UnknownLink } from 'multiformats/link'

export interface UploaderContextState {
  storedDAGShards: CARMeta[]
}

export interface UploaderContextActions {
  /**
   * Upload a single file to the service.
   */
  uploadFile: (file: Blob) => Promise<Link<unknown, number, number, Version>>
  /**
   * Upload a directory of files to the service.
   */
  uploadDirectory: (files: File[]) => Promise<Link<unknown, number, number, Version>>
  /**
   * Store shards of a DAG (encoded as CAR files) to the service.
   */
  storeDAGShards: (shards: ReadableStream<CARData>) => Promise<CARMeta[]>
  /**
   * Register an "upload" with the service. Note: only required when using
   * `storeDAGShards`.
   */
  registerUpload: (root: UnknownLink, shards: CARLink[]) => Promise<void>
}

export type UploaderContextValue = [
  state: UploaderContextState,
  actions: UploaderContextActions
]

const UploaderContext = createContext<UploaderContextValue>([
  { storedDAGShards: [] },
  {
    uploadFile: async () => { throw new Error('missing uploader context provider') },
    uploadDirectory: async () => { throw new Error('missing uploader context provider') },
    storeDAGShards: async () => { throw new Error('missing uploader context provider') },
    registerUpload: async () => { throw new Error('missing uploader context provider') }
  }
])

/**
 * Provider for actions and state to facilitate uploads to the service.
 */
export const UploaderProvider: ParentComponent = props => {
  const [auth] = useAuth()
  const [state, setState] = createStore<UploaderContextState>({ storedDAGShards: [] })

  const actions: UploaderContextActions = {
    async uploadFile (file: Blob) {
      const fileStream = createFileEncoderStream(file)
      const blockMemoStream = new BlockMemoStream()
      const shardStream = new ShardingStream()

      const meta = await actions.storeDAGShards(fileStream.pipeThrough(blockMemoStream).pipeThrough(shardStream))
      const root = blockMemoStream.memo?.cid
      if (root == null) throw new Error('missing root block')

      await actions.registerUpload(root, meta.map(m => m.cid))
      return root
    },
    async uploadDirectory (files: File[]) {
      const dirStream = createDirectoryEncoderStream(files)
      const blockMemoStream = new BlockMemoStream()
      const shardStream = new ShardingStream()

      const meta = await actions.storeDAGShards(dirStream.pipeThrough(blockMemoStream).pipeThrough(shardStream))
      const root = blockMemoStream.memo?.cid
      if (root == null) throw new Error('missing root block')

      await actions.registerUpload(root, meta.map(m => m.cid))
      return root
    },
    async storeDAGShards (shards) {
      if (auth.account == null) throw new Error('missing account')
      if (auth.issuer == null) throw new Error('missing issuer')

      const storedShards: CARMeta[] = []
      setState('storedDAGShards', storedShards)

      await shards
        .pipeThrough(new ShardStoringStream(auth.account, auth.issuer))
        .pipeThrough(new TransformStream({
          transform (meta, controller) {
            storedShards.push(meta)
            setState('storedDAGShards', [...storedShards])
            controller.enqueue(meta)
          }
        }))
        .pipeTo(new WritableStream())

      return storedShards
    },
    async registerUpload (root: UnknownLink, shards: CARLink[]) {
      if (auth.account == null) throw new Error('missing account')
      if (auth.issuer == null) throw new Error('missing issuer')
      await registerUpload(auth.account, auth.issuer, root, shards)
    }
  }

  return createComponent(UploaderContext.Provider, {
    value: [state, actions],
    get children () {
      return props.children
    }
  })
}

/**
 * Use the scoped uploader context state from a parent `UploaderProvider`.
 */
export function useUploader (): UploaderContextValue {
  return useContext(UploaderContext)
}

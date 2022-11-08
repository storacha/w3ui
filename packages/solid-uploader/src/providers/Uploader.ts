import { createContext, useContext, createComponent, ParentComponent } from 'solid-js'
import { createStore } from 'solid-js/store'
import {
  createFileEncoderStream,
  createDirectoryEncoderStream,
  ShardingStream,
  ShardStoringStream,
  CARMetadata,
  CARLink,
  registerUpload,
  storeDAG
} from '@w3ui/uploader-core'
import { useAuth } from '@w3ui/solid-keyring'
import { Link, Version, UnknownLink } from 'multiformats/link'

export interface UploaderContextState {
  storedDAGShards: CARMetadata[]
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
   * Store a DAG (encoded as a CAR file) to the service.
   */
  storeDAG: (data: Blob) => Promise<CARLink>
  /**
   * Register an "upload" with the service. Note: only required when using
   * `storeDAG`.
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
    storeDAG: async () => { throw new Error('missing uploader context provider') },
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
      if (auth.account == null) throw new Error('missing account')
      if (auth.issuer == null) throw new Error('missing issuer')

      const storedShards: CARMetadata[] = []
      setState('storedDAGShards', storedShards)

      await createFileEncoderStream(file)
        .pipeThrough(new ShardingStream())
        .pipeThrough(new ShardStoringStream(auth.account, auth.issuer))
        .pipeTo(new WritableStream({
          write (meta) {
            storedShards.push(meta)
            setState('storedDAGShards', [...storedShards])
          }
        }))

      const root = storedShards.at(-1)?.roots[0]
      if (root == null) throw new Error('missing root CID')

      await actions.registerUpload(root, storedShards.map(s => s.cid))
      return root
    },
    async uploadDirectory (files: File[]) {
      if (auth.account == null) throw new Error('missing account')
      if (auth.issuer == null) throw new Error('missing issuer')

      const storedShards: CARMetadata[] = []
      setState('storedDAGShards', storedShards)

      await createDirectoryEncoderStream(files)
        .pipeThrough(new ShardingStream())
        .pipeThrough(new ShardStoringStream(auth.account, auth.issuer))
        .pipeTo(new WritableStream({
          write (meta) {
            storedShards.push(meta)
            setState('storedDAGShards', [...storedShards])
          }
        }))

      const root = storedShards.at(-1)?.roots[0]
      if (root == null) throw new Error('missing root CID')

      await actions.registerUpload(root, storedShards.map(s => s.cid))
      return root
    },
    async storeDAG (data) {
      if (auth.account == null) throw new Error('missing account')
      if (auth.issuer == null) throw new Error('missing issuer')
      return await storeDAG(auth.account, auth.issuer, data)
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

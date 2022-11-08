import React, { useContext, createContext, useState, ReactNode } from 'react'
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
import { useAuth } from '@w3ui/react-keyring'
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

export interface UploaderProviderProps {
  children?: ReactNode
}

/**
 * Provider for actions and state to facilitate uploads to the service.
 */
export function UploaderProvider ({ children }: UploaderProviderProps): ReactNode {
  const { account, issuer } = useAuth()
  const [storedDAGShards, setStoredDAGShards] = useState<UploaderContextState['storedDAGShards']>([])

  const state = { storedDAGShards }
  const actions: UploaderContextActions = {
    async uploadFile (file: Blob) {
      if (account == null) throw new Error('missing account')
      if (issuer == null) throw new Error('missing issuer')

      const storedShards: CARMetadata[] = []
      setStoredDAGShards(storedShards)

      await createFileEncoderStream(file)
        .pipeThrough(new ShardingStream())
        .pipeThrough(new ShardStoringStream(account, issuer))
        .pipeTo(new WritableStream({
          write (meta) {
            storedShards.push(meta)
            setStoredDAGShards([...storedShards])
          }
        }))

      const root = storedShards.at(-1)?.roots[0]
      if (root == null) throw new Error('missing root CID')

      await actions.registerUpload(root, storedShards.map(s => s.cid))
      return root
    },
    async uploadDirectory (files: File[]) {
      if (account == null) throw new Error('missing account')
      if (issuer == null) throw new Error('missing issuer')

      const storedShards: CARMetadata[] = []
      setStoredDAGShards(storedShards)

      await createDirectoryEncoderStream(files)
        .pipeThrough(new ShardingStream())
        .pipeThrough(new ShardStoringStream(account, issuer))
        .pipeTo(new WritableStream({
          write (meta) {
            storedShards.push(meta)
            setStoredDAGShards([...storedShards])
          }
        }))

      const root = storedShards.at(-1)?.roots[0]
      if (root == null) throw new Error('missing root CID')

      await actions.registerUpload(root, storedShards.map(s => s.cid))
      return root
    },
    async storeDAG (data) {
      if (account == null) throw new Error('missing account')
      if (issuer == null) throw new Error('missing issuer')
      return await storeDAG(account, issuer, data)
    },
    async registerUpload (root: UnknownLink, shards: CARLink[]) {
      if (account == null) throw new Error('missing account')
      if (issuer == null) throw new Error('missing issuer')
      await registerUpload(account, issuer, root, shards)
    }
  }

  return (
    <UploaderContext.Provider value={[state, actions]}>
      {children}
    </UploaderContext.Provider>
  )
}

/**
 * Use the scoped uploader context state from a parent `UploaderProvider`.
 */
export function useUploader (): UploaderContextValue {
  return useContext(UploaderContext)
}

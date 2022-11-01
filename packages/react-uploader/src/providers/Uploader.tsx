import React, { useContext, createContext, useState, ReactNode } from 'react'
import { createFileEncoderStream, createDirectoryEncoderStream, ShardingStream, storeDAGShards, ShardMeta, CarData, registerUpload, BlockMemoStream } from '@w3ui/uploader-core'
import { useAuth } from '@w3ui/react-keyring'
import { CID } from 'multiformats/cid'

export interface UploaderContextState {
  storedDAGShards: ShardMeta[]
}

export interface UploaderContextActions {
  /**
   * Upload a single file to the service.
   */
  uploadFile: (file: Blob) => Promise<CID>
  /**
   * Upload a directory of files to the service.
   */
  uploadDirectory: (files: File[]) => Promise<CID>
  /**
   * Store shards of a DAG (encoded as CAR files) to the service.
   */
  storeDAGShards: (shards: ReadableStream<CarData>) => Promise<CID[]>
  /**
   * Register an "upload" with the service.
   */
  registerUpload: (root: CID, shards: CID[]) => Promise<void>
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
      const fileStream = createFileEncoderStream(file)
      const blockMemoStream = new BlockMemoStream()
      const shardStream = new ShardingStream()

      const shards = await actions.storeDAGShards(fileStream.pipeThrough(blockMemoStream).pipeThrough(shardStream))
      const root = CID.asCID(blockMemoStream.memo?.cid)
      if (root == null) throw new Error('missing root block')

      await actions.registerUpload(root, shards)
      return root
    },
    async uploadDirectory (files: File[]) {
      const dirStream = createDirectoryEncoderStream(files)
      const blockMemoStream = new BlockMemoStream()
      const shardStream = new ShardingStream()

      const shards = await actions.storeDAGShards(dirStream.pipeThrough(blockMemoStream).pipeThrough(shardStream))
      const root = CID.asCID(blockMemoStream.memo?.cid)
      if (root == null) throw new Error('missing root block')

      await actions.registerUpload(root, shards)
      return root
    },
    async storeDAGShards (shards) {
      if (account == null) throw new Error('missing account')
      if (issuer == null) throw new Error('missing issuer')

      const storedShards: ShardMeta[] = []
      setStoredDAGShards(storedShards)

      return await storeDAGShards(account, issuer, shards, {
        onShardStored: e => {
          storedShards.push(e.meta)
          setStoredDAGShards([...storedShards])
        }
      })
    },
    async registerUpload (root: CID, shards: CID[]) {
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

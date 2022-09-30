import React, { useContext, createContext, useState, ReactNode } from 'react'
import { uploadCarChunks, CarChunkMeta } from '@w3ui/uploader-core'
import { useAuth } from '@w3ui/react-wallet'

export interface UploaderContextState {
  uploadedCarChunks: CarChunkMeta[]
}

export interface UploaderContextActions {
  /**
   * Upload CAR bytes to the service.
   */
  uploadCarChunks: (chunks: AsyncIterable<AsyncIterable<Uint8Array>>) => Promise<void>
}

export type UploaderContextValue = [
  state: UploaderContextState,
  actions: UploaderContextActions
]

const UploaderContext = createContext<UploaderContextValue>([
  { uploadedCarChunks: [] },
  { uploadCarChunks: async () => { throw new Error('missing uploader context provider') } }
])

export interface UploaderProviderProps {
  children?: ReactNode
}

export function UploaderProvider ({ children }: UploaderProviderProps): ReactNode {
  const { identity } = useAuth()
  const [uploadedCarChunks, setUploadedCarChunks] = useState<UploaderContextState['uploadedCarChunks']>([])

  const state = { uploadedCarChunks }
  const actions: UploaderContextActions = {
    async uploadCarChunks (chunks) {
      if (identity == null) {
        throw new Error('missing identity')
      }
      const uploadedChunks: CarChunkMeta[] = []
      setUploadedCarChunks(uploadedChunks)
      await uploadCarChunks(identity.signingPrincipal, chunks, {
        onChunkUploaded: e => {
          uploadedChunks.push(e.meta)
          setUploadedCarChunks([...uploadedChunks])
        }
      })
    }
  }

  return (
    <UploaderContext.Provider value={[state, actions]}>
      {children}
    </UploaderContext.Provider>
  )
}

export function useUploader (): UploaderContextValue {
  return useContext(UploaderContext)
}

import { createContext, useContext, createComponent, ParentComponent } from 'solid-js'
import { createStore } from 'solid-js/store'
import { uploadCarChunks, CarChunkMeta } from '@w3ui/uploader-core'
import { useAuth } from '@w3ui/solid-wallet'

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

export const UploaderProvider: ParentComponent = props => {
  const [auth] = useAuth()
  const [state] = createStore<UploaderContextState>({ uploadedCarChunks: [] })

  const actions: UploaderContextActions = {
    async uploadCarChunks (chunks) {
      if (auth.identity == null) {
        throw new Error('missing identity')
      }
      state.uploadedCarChunks = []
      await uploadCarChunks(auth.identity.signingPrincipal, chunks, {
        onChunkUploaded: e => {
          state.uploadedCarChunks = [...state.uploadedCarChunks, e.meta]
        }
      })
    }
  }

  return createComponent(UploaderContext.Provider, {
    value: [state, actions],
    get children () {
      return props.children
    }
  })
}

export function useUploader (): UploaderContextValue {
  return useContext(UploaderContext)
}

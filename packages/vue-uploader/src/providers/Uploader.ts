import { defineComponent, provide, InjectionKey, inject, Ref, shallowReactive, computed } from 'vue'
import { AuthProviderInjectionKey } from '@w3ui/vue-wallet'
import { uploadCarChunks, CarChunkMeta } from '@w3ui/uploader-core'

/**
 * Injection keys for uploader context.
 */
export const UploaderProviderInjectionKey = {
  uploadedCarChunks: Symbol('w3ui uploader uploadedCarChunks') as InjectionKey<Ref<UploaderContextState['uploadedCarChunks']>>,
  uploadCarChunks: Symbol('w3ui uploader uploadCarChunks') as InjectionKey<UploaderContextActions['uploadCarChunks']>
}

export interface UploaderContextState {
  uploadedCarChunks: CarChunkMeta[]
}

export interface UploaderContextActions {
  /**
   * Upload CAR bytes to the service.
   */
  uploadCarChunks: (chunks: AsyncIterable<AsyncIterable<Uint8Array>>) => Promise<void>
}

export const UploaderProvider = defineComponent({
  setup () {
    const identity = inject(AuthProviderInjectionKey.identity)
    const state = shallowReactive<UploaderContextState>({
      uploadedCarChunks: []
    })

    provide(UploaderProviderInjectionKey.uploadedCarChunks, computed(() => state.uploadedCarChunks))
    provide(UploaderProviderInjectionKey.uploadCarChunks, async (chunks) => {
      if (identity?.value == null) {
        throw new Error('missing identity')
      }
      state.uploadedCarChunks = []
      await uploadCarChunks(identity.value.signingPrincipal, chunks, {
        onChunkUploaded: e => {
          state.uploadedCarChunks = [...state.uploadedCarChunks, e.meta]
        }
      })
    })

    return state
  },

  // Our provider component is a renderless component
  // it does not render any markup of its own.
  render () {
    // @ts-expect-error
    return this.$slots.default()
  }
})

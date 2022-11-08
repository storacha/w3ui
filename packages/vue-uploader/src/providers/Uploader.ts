import { defineComponent, provide, InjectionKey, inject, Ref, shallowReactive, computed } from 'vue'
import { AuthProviderInjectionKey } from '@w3ui/vue-keyring'
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
import { Link, Version, UnknownLink } from 'multiformats/link'

/**
 * Injection keys for uploader context.
 */
export const UploaderProviderInjectionKey = {
  uploadFile: Symbol('w3ui uploader uploadFile') as InjectionKey<UploaderContextActions['uploadFile']>,
  uploadDirectory: Symbol('w3ui uploader uploadDirectory') as InjectionKey<UploaderContextActions['uploadDirectory']>,
  storeDAG: Symbol('w3ui uploader storeDAG') as InjectionKey<UploaderContextActions['storeDAG']>,
  registerUpload: Symbol('w3ui uploader registerUpload') as InjectionKey<UploaderContextActions['registerUpload']>,
  storedDAGShards: Symbol('w3ui uploader storedDAGShards') as InjectionKey<Ref<UploaderContextState['storedDAGShards']>>
}

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

/**
 * Provider for actions and state to facilitate uploads to the service.
 */
export const UploaderProvider = defineComponent({
  setup () {
    const account = inject(AuthProviderInjectionKey.account)
    const issuer = inject(AuthProviderInjectionKey.issuer)
    const state = shallowReactive<UploaderContextState>({
      storedDAGShards: []
    })

    provide(UploaderProviderInjectionKey.storedDAGShards, computed(() => state.storedDAGShards))

    const actions: UploaderContextActions = {
      async uploadFile (file: Blob) {
        if (account?.value == null) throw new Error('missing account')
        if (issuer?.value == null) throw new Error('missing issuer')

        const storedShards: CARMetadata[] = []
        state.storedDAGShards = storedShards

        await createFileEncoderStream(file)
          .pipeThrough(new ShardingStream())
          .pipeThrough(new ShardStoringStream(account.value, issuer.value))
          .pipeTo(new WritableStream({
            write (meta) {
              storedShards.push(meta)
              state.storedDAGShards = [...storedShards]
            }
          }))

        const root = storedShards.at(-1)?.roots[0]
        if (root == null) throw new Error('missing root CID')

        await actions.registerUpload(root, storedShards.map(s => s.cid))
        return root
      },
      async uploadDirectory (files: File[]) {
        if (account?.value == null) throw new Error('missing account')
        if (issuer?.value == null) throw new Error('missing issuer')

        const storedShards: CARMetadata[] = []
        state.storedDAGShards = storedShards

        await createDirectoryEncoderStream(files)
          .pipeThrough(new ShardingStream())
          .pipeThrough(new ShardStoringStream(account.value, issuer.value))
          .pipeTo(new WritableStream({
            write (meta) {
              storedShards.push(meta)
              state.storedDAGShards = [...storedShards]
            }
          }))

        const root = storedShards.at(-1)?.roots[0]
        if (root == null) throw new Error('missing root CID')

        await actions.registerUpload(root, storedShards.map(s => s.cid))
        return root
      },
      async storeDAG (data) {
        if (account?.value == null) throw new Error('missing account')
        if (issuer?.value == null) throw new Error('missing issuer')
        return await storeDAG(account.value, issuer.value, data)
      },
      async registerUpload (root: UnknownLink, shards: CARLink[]) {
        if (account?.value == null) throw new Error('missing account')
        if (issuer?.value == null) throw new Error('missing issuer')
        await registerUpload(account.value, issuer.value, root, shards)
      }
    }

    provide(UploaderProviderInjectionKey.uploadFile, actions.uploadFile)
    provide(UploaderProviderInjectionKey.uploadDirectory, actions.uploadDirectory)
    provide(UploaderProviderInjectionKey.storeDAG, actions.storeDAG)
    provide(UploaderProviderInjectionKey.registerUpload, actions.registerUpload)

    return state
  },

  // Our provider component is a renderless component
  // it does not render any markup of its own.
  render () {
    // @ts-expect-error
    return this.$slots.default()
  }
})

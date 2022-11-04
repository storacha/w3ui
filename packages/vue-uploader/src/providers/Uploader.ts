import { defineComponent, provide, InjectionKey, inject, Ref, shallowReactive, computed } from 'vue'
import { AuthProviderInjectionKey } from '@w3ui/vue-keyring'
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
import { Link, Version, UnknownLink } from 'multiformats/link'

/**
 * Injection keys for uploader context.
 */
export const UploaderProviderInjectionKey = {
  uploadFile: Symbol('w3ui uploader uploadFile') as InjectionKey<UploaderContextActions['uploadFile']>,
  uploadDirectory: Symbol('w3ui uploader uploadDirectory') as InjectionKey<UploaderContextActions['uploadDirectory']>,
  storeDAGShards: Symbol('w3ui uploader storeDAGShards') as InjectionKey<UploaderContextActions['storeDAGShards']>,
  registerUpload: Symbol('w3ui uploader registerUpload') as InjectionKey<UploaderContextActions['registerUpload']>,
  storedDAGShards: Symbol('w3ui uploader storedDAGShards') as InjectionKey<Ref<UploaderContextState['storedDAGShards']>>
}

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
        if (account?.value == null) throw new Error('missing account')
        if (issuer?.value == null) throw new Error('missing issuer')

        const storedShards: CARMeta[] = []
        state.storedDAGShards = storedShards

        await shards
          .pipeThrough(new ShardStoringStream(account.value, issuer.value))
          .pipeThrough(new TransformStream({
            transform (meta, controller) {
              storedShards.push(meta)
              state.storedDAGShards = [...storedShards]
              controller.enqueue(meta)
            }
          }))
          .pipeTo(new WritableStream())

        return storedShards
      },
      async registerUpload (root: UnknownLink, shards: CARLink[]) {
        if (account?.value == null) throw new Error('missing account')
        if (issuer?.value == null) throw new Error('missing issuer')
        await registerUpload(account.value, issuer.value, root, shards)
      }
    }

    provide(UploaderProviderInjectionKey.uploadFile, actions.uploadFile)
    provide(UploaderProviderInjectionKey.uploadDirectory, actions.uploadDirectory)
    provide(UploaderProviderInjectionKey.storeDAGShards, actions.storeDAGShards)
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

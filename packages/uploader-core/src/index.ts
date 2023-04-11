import { Link, Version } from 'multiformats'
import type { CARMetadata, Service } from '@web3-storage/upload-client/types'
import type { ConnectionView, Principal } from '@ucanto/interface'

export { uploadFile, uploadDirectory } from '@web3-storage/upload-client'

export type { CARMetadata, Service }

export type CID = Link<unknown, number, number, Version>
export interface UploaderContextState {
  storedDAGShards: CARMetadata[]
}

export interface ServiceConfig {
  servicePrincipal?: Principal
  connection?: ConnectionView<Service>
}

export interface UploaderContextActions {
  /**
   * Upload a single file to the current space.
   */
  uploadFile: (file: Blob) => Promise<CID>
  /**
   * Upload a directory of files to the current space.
   */
  uploadDirectory: (
    files: File[]
  ) => Promise<CID>
}

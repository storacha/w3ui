import { Link, Version } from 'multiformats'
import { CARMetadata, Service } from '@web3-storage/upload-client/types'
import { ConnectionView, Principal } from '@ucanto/interface'
export * from '@web3-storage/upload-client'

export { CARMetadata, Service }

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
  uploadFile: (file: Blob) => Promise<Link<unknown, number, number, Version>>
  /**
   * Upload a directory of files to the current space.
   */
  uploadDirectory: (files: File[]) => Promise<Link<unknown, number, number, Version>>
}

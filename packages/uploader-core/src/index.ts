import { Link, Version } from 'multiformats'
import { CARMetadata } from '@web3-storage/upload-client/types'
export * from '@web3-storage/upload-client'

export { CARMetadata, Link }

export interface UploaderContextState {
  storedDAGShards: CARMetadata[]
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

import { Capability, Proof, Signer } from '@ucanto/interface'
import { add as storeAdd } from '@web3-storage/access/capabilities/store'
import { add as uploadAdd } from '@web3-storage/access/capabilities/upload'
import { uploadFile, uploadDirectory, BlobLike, FileLike } from '@web3-storage/upload-client'

export * from '@web3-storage/upload-client'

export interface ProofProvider {
  issuer: Signer
  getProofs (capabilities: Capability[]): Proof[]
}

// TODO: move to @web3-storage/upload-client
class Client {
  #proofProvider: ProofProvider

  constructor(proofProvider: ProofProvider) {
    this.#proofProvider = proofProvider
  }

  /**
   * Uploads a file to the service and returns the root data CID for the
   * generated DAG.
   */
  async uploadFile(file: BlobLike, options = {}) {
    const conf = { issuer: this.#proofProvider.issuer, proofs: this.#proofProvider.getProofs([uploadAdd, storeAdd]) }
    return await uploadFile(conf, file, options)
  }

  /**
   * Uploads a directory of files to the service and returns the root data CID
   * for the generated DAG. All files are added to a container directory, with
   * paths in file names preserved.
   *
   * @param {import('./types').FileLike[]} files File data.
   * @param {UploadOptions} [options]
   */
  async uploadDirectory(files: FileLike[], options = {}) {
    return await uploadDirectory(this.#conf, files, options)
  }
}

/**
 * Create a new upload client from the passed signer and proof provider.
 */
export function createUploader (issuer: Signer, proofProvider: ProofProvider) {
  return Client.fromAgent(agent)
}

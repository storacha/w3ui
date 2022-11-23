import { createResource, InitializedResourceReturn, ResourceOptions, ResourceReturn, ResourceSource } from 'solid-js'
import type { Space } from '@w3ui/keyring-core'
import { list, ServiceConfig, UploadListResult } from '@w3ui/uploads-list-core'
import type { Capability, DID, Principal, Proof, Signer } from '@ucanto/interface'
import { list as uploadList } from '@web3-storage/access/capabilities/upload'

interface UploadsListSource extends ServiceConfig {
  space: Space,
  agent: Signer,
  getProofs: (caps: Capability[]) => Promise<Proof[]>
}

/**
 * Create a solid resource configured to fetch data from the service. Please
 * see the docs for [`createResource`](https://www.solidjs.com/docs/latest/api#createresource)
 * for parameter and return type descriptions.
 */
export function createUploadsListResource (source: ResourceSource<UploadsListSource>, options?: ResourceOptions<UploadListResult[], UploadsListSource>): ResourceReturn<UploadListResult[]> | InitializedResourceReturn<UploadListResult[]> {
  // TODO: WIRE IN CURSOR AND SIZE
  return createResource<UploadListResult[], UploadsListSource>(
    source,
    async ({ space, agent, servicePrincipal, connection, getProofs }) => {
      const conf = {
        issuer: agent,
        with: space.did(),
        audience: servicePrincipal,
        proofs: await getProofs([{ can: uploadList.can, with: space.did() }])
      }
      const page = await list(conf, { connection })
      return page.results ?? []
    },
    options
  )
}

import { createResource, InitializedResourceReturn, ResourceOptions, ResourceReturn, ResourceSource } from 'solid-js'
import { listUploads, ListPage } from '@w3ui/uploads-list-core'
import type { DID, Signer } from '@ucanto/interface'

interface UploadsListSource {
  account: DID
  issuer: Signer
}

/**
 * Create a solid resource configured to fetch data from the service. Please
 * see the docs for [`createResource`](https://www.solidjs.com/docs/latest/api#createresource)
 * for parameter and return type descriptions.
 */
export function createUploadsListResource (source: ResourceSource<UploadsListSource>, options?: ResourceOptions<ListPage, UploadsListSource>): ResourceReturn<ListPage> | InitializedResourceReturn<ListPage> {
  return createResource<ListPage, UploadsListSource>(
    source,
    async ({ account, issuer }) => { return await listUploads(account, issuer) },
    options
  )
}

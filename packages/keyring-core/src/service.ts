import { connect } from '@ucanto/client'
import { CAR, CBOR, HTTP } from '@ucanto/transport'
import * as DID from '@ipld/dag-ucan/did'
import type { Service } from '@web3-storage/access/types'

export const serviceURL = new URL('https://access.web3.storage')
export const servicePrincipal = DID.parse('did:key:z6MkrZ1r5XBFZjBU34qyD8fueMbMRkKw17BZaq2ivKFjnz2z')

export const connection = connect({
  id: servicePrincipal,
  encoder: CAR,
  decoder: CBOR,
  channel: HTTP.open<Service>({
    url: serviceURL,
    method: 'POST',
  })
})

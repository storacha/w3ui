import { create, provide, Failure } from '@ucanto/server'
import * as Client from '@ucanto/client'
import { Service } from '@web3-storage/access/types'

import * as EdSigner from '@ucanto/principal/ed25519'
import * as Transport from '@ucanto/transport'

import * as Space from '@web3-storage/capabilities/space'
import * as Voucher from '@web3-storage/capabilities/voucher'

export class MockAccessService implements Service {
  voucher = {
    claim: provide(Voucher.claim, async () => {
      console.log('voucher/claim')
      return undefined
    }),

    redeem: provide(Voucher.redeem, async () => {
      console.log('voucher/redeem')
    })
  }

  space = {
    info: provide(Space.info, async () => {
      console.log('space/info')
      return new Failure('not implemented')
    }),
    'recover-validation': provide(Space.recoverValidation, async () => {
      console.log('space/recover-validation')
      return undefined
    }),
    recover: provide(Space.recover, async () => {
      console.log('space/recover')
      return []
    })
  }


  constructor({} = {}) {
    // for (const [method, impl] of Object.keys(voucher ?? {})) {
    //   this.voucher[method] = impl
    // }
    
    // for (const [method, impl] of Object.keys(space ?? {})) {
    //   this.space[method] = impl
    // }  
  }
}

export async function mockAcccessConnection() {
  const service = new MockAccessService()

  const serverPrincipal = await EdSigner.generate()
  const server = create({
    id: serverPrincipal,
    service,
    encoder: Transport.CBOR,
    decoder: Transport.CAR,
  })
  const client = Client.connect({
    id: serverPrincipal,
    channel: server,
    decoder: Transport.CBOR,
    encoder: Transport.CAR,
  })
  return client
}
import { provide, Failure } from '@ucanto/server'
import { Service } from '@web3-storage/access/types'

import * as Space from '@web3-storage/capabilities/space'
import * as Voucher from '@web3-storage/capabilities/voucher'

export class MockAccessService implements Service {
  voucher = {
    claim: provide(Voucher.claim, async () => {
      return undefined
    }),

    redeem: provide(Voucher.redeem, async () => {

    })
  }

  space = {
    info: provide(Space.info, async () => {
      return new Failure('not implemented')
    }),
    'recover-validation': provide(Space.recoverValidation, async () => {
      return undefined
    }),
    recover: provide(Space.recover, async () => {
      return []
    })
  }

  constructor({ voucher, space }: { voucher?: Partial<Service['voucher']>, space?: Partial<Service['space']>} = {}) {
    for (const [method, impl] of Object.keys(voucher ?? {})) {
      this.voucher[method] = impl
    }
    
    for (const [method, impl] of Object.keys(space ?? {})) {
      this.space[method] = impl
    }  
  }
}
import test from 'ava'
import { JSDOM } from 'jsdom'
import 'fake-indexeddb/auto'

import { connect } from '@ucanto/client'
import * as Server from '@ucanto/server'
import * as Transport from '@ucanto/transport'
import { generate } from '@ucanto/principal/ed25519'
import { MockAccessService } from './utils/mock-service.js'
import type { ConnectionView } from '@ucanto/interface'
import type { Service as AccessService } from '@web3-storage/access/types'

import { createAgent } from '../src/index.js'

test.before((t) => {
  const dom = new JSDOM('<!DOCTYPE html>')
  globalThis.document = dom.window.document
})

test('createAgent', async (t) => {
  const service = new MockAccessService()
  const servicePrincipal = await generate()
  const server = Server.create({
    id: servicePrincipal,
    decoder: Transport.CAR,
    encoder: Transport.CBOR,
    service,
  })
  const connection: ConnectionView<AccessService> = connect({
    id: servicePrincipal,
    encoder: Transport.CAR,
    decoder: Transport.CBOR,
    channel: server,
  })
  const agent = await createAgent({
    connection
  })
  t.truthy(agent)
})
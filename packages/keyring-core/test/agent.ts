import test from 'ava'
import type { ExecutionContext } from 'ava'
import { JSDOM } from 'jsdom'
import 'fake-indexeddb/auto'

import { createAgent } from '../src/index.js'
import { mockAcccessConnection } from './utils/mock-service.js'

test.before((t) => {
  const dom = new JSDOM('<!DOCTYPE html>')
  globalThis.document = dom.window.document
})

test('createAgent', async (t) => {
  const agent = await createAgent()
  t.truthy(agent)
  t.true(agent.did().startsWith('did:key'))
  t.is(agent.spaces.size, 0)
})

test('createSpace', async (t) => {
  const agent = await createAgent()
  const space = await agent.createSpace('test')
  t.truthy(space)
  t.true(space.did.startsWith('did:key:'))
})

test('registerSpace fails if no current space is set', async (t) => {
  const agent = await createAgent()
  await t.throwsAsync(agent.registerSpace('foo@bar.net'))
})

// TODO: finish access service mock and add mock websocket server for validation result
test.skip('registerSpace invokes voucher/claim on access service', async (t) => {
  const agent = await createAgent({
    connection: await mockAcccessConnection()
  })
  const space = await agent.createSpace('test')
  await agent.setCurrentSpace(space.did)

  await agent.registerSpace('foo@bar.net')
})
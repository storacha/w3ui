import { useContext, createContext, useState, useEffect } from 'react'
import type { ServiceConfig } from '@w3ui/keyring-core'
import { useKeyring } from '@w3ui/react-keyring'
import * as Pail from '@alanshaw/pail/crdt'
import { AnyLink } from '@alanshaw/pail/link'
import { ShardBlock, ShardValueEntry } from '@alanshaw/pail/shard'
import { EventLink } from '@alanshaw/pail/clock'
import * as RemoteClock from '@web3-storage/clock/client'
import { BlockFetcher, GatewayBlockFetcher, MemoryBlockstore, withCache } from './blocks'
import { EventData } from '@alanshaw/pail/crdt'

const LIMIT = 25

export type BucketContextValue = [
  state: BucketContextState,
  actions: BucketContextActions
]

export interface BucketContextState {
  readonly prefix: string
  readonly entries: ShardValueEntry[]
  readonly offset: number
  readonly limit: number
  readonly loading: boolean
}

export interface BucketContextActions {
  put (key: string, value: AnyLink): Promise<void>
  delete (key: string): Promise<void>
  setPrefix (prefix: string): Promise<void>
  setOffset (offset: number): Promise<void>
  setLimit (limit: number): Promise<void>
}

export const bucketContextDefaultValue: BucketContextValue = [
  {
    prefix: '',
    entries: [],
    offset: 0,
    limit: LIMIT,
    loading: false
  },
  {
    put: async () => {
      throw new Error('missing bucket context provider')
    },
    delete: async () => {
      throw new Error('missing bucket context provider')
    },
    setPrefix: async () => {
      throw new Error('missing bucket context provider')
    },
    setOffset: async () => {
      throw new Error('missing bucket context provider')
    },
    setLimit: async () => {
      throw new Error('missing bucket context provider')
    }
  }
]

export const BucketContext = createContext<BucketContextValue>(
  bucketContextDefaultValue
)

export interface BucketProviderProps extends ServiceConfig {
  children?: JSX.Element
}

/**
 * Provider for actions and state to facilitate bucket management.
 */
export function BucketProvider ({ children }: BucketProviderProps): JSX.Element | null {
  const blocksCache = new MemoryBlockstore() // TODO: cache in IDB?
  const blocks = withCache(new GatewayBlockFetcher(), blocksCache)

  const [{ space, agent }, { getProofs }] = useKeyring()
  const [head, setHead] = useState<EventLink<EventData>[]>([])
  const [loading, setLoading] = useState(false)
  const [prefix, setPrefix] = useState('')
  const [entries, setEntries] = useState<ShardValueEntry[]>([])
  const [offset, setOffset] = useState(0)
  const [limit, setLimit] = useState(LIMIT)

  useEffect(() => {
    if (!space || !agent) return
    ;(async (issuer, resource) => {
      setLoading(true)
      try {
        const proofs = await getProofs([{ can: 'clock/head', with: resource }])
        const receipt = await RemoteClock.head({ issuer, with: resource, proofs })
        if (receipt.out.error) return console.error(receipt.out.error)

        const head = receipt.out.ok.head as EventLink<EventData>[]
        const entries = []
        for await (const entry of Pail.entries(blocks, head)) {
          entries.push(entry)
          if (entries.length === LIMIT) break
        }

        setHead(head)
        setEntries(entries)
        setPrefix('')
        setOffset(0)
        setLimit(LIMIT)
      } catch (err) {
        console.error('failed to initialize bucket', err)
      } finally {
        setLoading(false)
      }
    })(agent, space.did())
  }, [agent, space])

  const state: BucketContextState = { loading, prefix, entries, offset, limit }
  const actions: BucketContextActions = {
    async put (key, value) {
      if (!agent || !space) throw new Error('missing agent and/or space')
      setLoading(true)
      try {
        const result = await Pail.put(blocks, head, key, value)
        await blocksCache.put(result.event)
        for (const block of result.additions) {
          await blocksCache.put(block)
        }
        // TODO: persist blocks to w3up

        // advance the remote
        const proofs = await getProofs([{ can: 'clock/advance', with: space.did() }])
        const receipt = await RemoteClock.advance(
          { issuer: agent, with: space.did(), proofs },
          result.event.cid,
          { blocks: [result.event] }
        )
        if (receipt.out.error) {
          throw new Error('failed to advance remote clock', { cause: receipt.out.error })
        }

        const remoteHead = receipt.out.ok.head as EventLink<EventData>[]
        const entries = await collectEntries(blocks, remoteHead, prefix, offset, limit)
        setHead(result.head)
        setEntries(entries)
      } catch (err) {
        console.error('failed to put', err)
      } finally {
        setLoading(false)
      }
    },
    async delete () {
      throw new Error('not implemented')
    },
    async setPrefix (prefix) {
      setLoading(true)
      try {
        const entries = await collectEntries(blocks, head, prefix, offset, limit)
        setPrefix(prefix)
        setEntries(entries)
      } catch (err) {
        console.error('failed to set prefix', err)
      } finally {
        setLoading(false)
      }
    },
    async setOffset (offset) {
      setLoading(true)
      try {
        const entries = await collectEntries(blocks, head, prefix, offset, limit)
        setOffset(offset)
        setEntries(entries)
      } catch (err) {
        console.error('failed to set offset', err)
      } finally {
        setLoading(false)
      }
    },
    async setLimit (limit) {
      setLoading(true)
      try {
        const entries = await collectEntries(blocks, head, prefix, offset, limit)
        setLimit(limit)
        setEntries(entries)
      } catch (err) {
        console.error('failed to set prefix', err)
      } finally {
        setLoading(false)
      }
    },
  }

  return (
    <BucketContext.Provider value={[state, actions]}>
      {children}
    </BucketContext.Provider>
  )
}

async function collectEntries (blocks: BlockFetcher, head: EventLink<EventData>[], prefix: string, offset: number, limit: number) {
  const entries = []
  let i = 0
  for await (const entry of Pail.entries(blocks, head, { prefix })) {
    if (i < offset) continue
    entries.push(entry)
    if (entries.length === limit) break
    i++
  }
  return entries
}

/**
 * Use the scoped bucket context state from a parent `BucketProvider`.
 */
export function useBucket (): BucketContextValue {
  return useContext(BucketContext)
}

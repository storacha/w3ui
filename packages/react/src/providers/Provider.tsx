import type {
  Client,
  ContextState,
  ContextActions,
  ServiceConfig,
  Space,
  Account,
  Store
} from '@w3ui/core'

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react'
import { createClient } from '@w3ui/core'

export { ContextState, ContextActions }

export type ContextValue = [
  state: ContextState,
  actions: ContextActions
]

export const ContextDefaultValue: ContextValue = [
  {
    client: undefined,
    accounts: [],
    spaces: []
  },
  { logout: async () => {} }
]

export const Context = createContext<ContextValue>(
  ContextDefaultValue
)

export interface ProviderProps extends ServiceConfig {
  children?: ReactNode
}

/**
 * W3UI provider.
 */
export function Provider ({
  children,
  servicePrincipal,
  connection
}: ProviderProps): ReactNode {
  const [client, setClient] = useState<Client>()
  const [events, setEvents] = useState<EventTarget>()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [spaces, setSpaces] = useState<Space[]>([])
  const [store, setStore] = useState<Store>()

  useEffect(() => {
    if ((client === undefined) || (events === undefined)) return

    const handleStoreSave: () => void = () => {
      setAccounts(Object.values(client.accounts()))
      setSpaces(client.spaces())
    }

    events.addEventListener('store:save', handleStoreSave)
    return () => {
      events?.removeEventListener('store:save', handleStoreSave)
    }
  }, [client, events])

  const setupClient = async (): Promise<void> => {
    const { client, events, store } = await createClient({ servicePrincipal, connection })
    setClient(client)
    setEvents(events)
    setAccounts(Object.values(client.accounts()))
    setSpaces(client.spaces())
    setStore(store)
  }

  const logout = async (): Promise<void> => {
    if (store) {
      await store.reset()
      // set state back to defaults
      setClient(undefined)
      setEvents(undefined)
      setAccounts([])
      setSpaces([])
      setStore(undefined)
      // try to set state up again
      await setupClient()
    }
  }

  useEffect(() => { setupClient() }, []) // load client - once.

  return (
    <Context.Provider value={[{ client, accounts, spaces }, { logout }]}>
      {children}
    </Context.Provider>
  )
}

/**
 * Use the scoped core context state from a parent Provider.
 */
export function useW3 (): ContextValue {
  return useContext(Context)
}

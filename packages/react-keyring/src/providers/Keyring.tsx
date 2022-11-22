import React, { createContext, useState, useContext, ReactNode } from 'react'
import { createAgent, Space, getCurrentSpace, getSpaces, KeyringContextState, KeyringContextActions } from '@w3ui/keyring-core'
import type { Agent } from '@web3-storage/access'
import type { Capability, DID, Proof, Signer } from '@ucanto/interface'
import type { RSASigner } from '@ucanto/principal/rsa'

export { KeyringContextState, KeyringContextActions }

export interface KeyringContextValue extends KeyringContextState, KeyringContextActions {}

export const KeyringContext = createContext<KeyringContextValue>({
  space: undefined,
  spaces: [],
  agent: undefined,
  loadAgent: async () => {},
  unloadAgent: async () => {},
  resetAgent: async () => {},
  createSpace: async () => {},
  setCurrentSpace: async () => {},
  registerSpace: async () => {},
  cancelRegisterSpace: () => {},
  getProofs: async () => []
})

export interface AuthProviderProps {
  children?: ReactNode
}

/**
 * Key management provider.
 */
export function KeyringProvider ({ children }: AuthProviderProps): ReactNode {
  const [agent, setAgent] = useState<Agent<RSASigner>>()
  const [space, setSpace] = useState<Space>()
  const [spaces, setSpaces] = useState<Space[]>([])
  const [issuer, setIssuer] = useState<Signer>()
  const [registerAbortController, setRegisterAbortController] = useState<AbortController>()

  const getAgent = async (): Promise<Agent<RSASigner>> => {
    if (agent == null) {
      const a = await createAgent()
      setAgent(a)
      setIssuer(a.issuer)
      setSpace(getCurrentSpace(a))
      setSpaces(getSpaces(a))
      return a
    }
    return agent
  }

  const cancelRegisterSpace = (): void => {
    if (registerAbortController != null) {
      registerAbortController.abort()
    }
  }

  const createSpace = async (name?: string): Promise<void> => {
    const agent = await getAgent()
    const { did } = await agent.createSpace(name)
    await agent.setCurrentSpace(did)
    setSpace(getCurrentSpace(agent))
  }

  const registerSpace = async (email: string): Promise<void> => {
    const agent = await getAgent()
    if (!space) throw new Error('create a space before registering')
    if (space.registered()) return // nothing to do

    const controller = new AbortController()
    setRegisterAbortController(controller)

    try {
      await agent.registerSpace(email, { signal: controller.signal })
      setSpace(getCurrentSpace(agent))
      setSpaces(getSpaces(agent))
    } catch (err) {
      if (!controller.signal.aborted) {
        throw err
      }
    }
  }

  const setCurrentSpace = async (did: DID): Promise<void> => {
    const agent = await getAgent()
    await agent.setCurrentSpace(did)
    setSpace(getCurrentSpace(agent))
  }

  const loadAgent = async (): Promise<void> => {
    if (agent != null) return
    await getAgent()
  }

  const unloadAgent = async (): Promise<void> => {
    setSpace(undefined)
    setSpaces([])
    setIssuer(undefined)
    setAgent(undefined)
  }

  const resetAgent = async (): Promise<void> => {
    const agent = await getAgent()
    await Promise.all([agent.store.reset(), unloadAgent()])
  }

  const getProofs = async (caps: Capability[]): Promise<Proof[]> => {
    const agent = await getAgent()
    return agent.proofs(caps)
  }

  const value = {
    space,
    spaces,
    agent: issuer,
    loadAgent,
    unloadAgent,
    resetAgent,
    createSpace,
    registerSpace,
    cancelRegisterSpace,
    setCurrentSpace,
    getProofs
  }

  return (
    <KeyringContext.Provider value={value}>
      {children}
    </KeyringContext.Provider>
  )
}

/**
 * Use the scoped keyring context state from a parent KeyringProvider.
 */
export function useKeyring (): KeyringContextValue {
  return useContext(KeyringContext)
}

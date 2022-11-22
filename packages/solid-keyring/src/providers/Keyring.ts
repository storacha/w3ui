import { createContext, useContext, createSignal, createComponent, ParentComponent } from 'solid-js'
import { createStore } from 'solid-js/store'
import { createAgent, getCurrentSpace, getSpaces, KeyringContextState, KeyringContextActions } from '@w3ui/keyring-core'
import type { Agent } from '@web3-storage/access'
import type { Capability, DID } from '@ucanto/interface'
import type { RSASigner } from '@ucanto/principal/rsa'

export { KeyringContextState, KeyringContextActions }

export type KeyringContextValue = [
  state: KeyringContextState,
  actions: KeyringContextActions
]

const defaultState: KeyringContextState = {
  space: undefined,
  spaces: [],
  agent: undefined
}

export const AuthContext = createContext<KeyringContextValue>([
  defaultState,
  {
    loadAgent: async () => {},
    unloadAgent: async () => {},
    resetAgent: async () => {},
    createSpace: async () => {},
    setCurrentSpace: async () => {},
    registerSpace: async () => {},
    cancelRegisterSpace: () => {},
    getProofs: async () => []
  }
])

/**
 * Key management provider.
 */
export const KeyringProvider: ParentComponent = props => {
  const [state, setState] = createStore({
    space: defaultState.space,
    spaces: defaultState.spaces,
    agent: defaultState.agent
  })

  const [agent, setAgent] = createSignal<Agent<RSASigner>>()
  const [registerAbortController, setRegisterAbortController] = createSignal<AbortController>()

  const getAgent = async (): Promise<Agent<RSASigner>> => {
    let a = agent()
    if (a == null) {
      a = await createAgent()
      setAgent(a)
      setState('agent', a.issuer)
      setState('space', getCurrentSpace(a))
      setState('spaces', getSpaces(a))
    }
    return a
  }

  const cancelRegisterSpace = (): void => {
    const controller = registerAbortController()
    if (controller != null) {
      controller.abort()
    }
  }

  const createSpace = async (name?: string): Promise<void> => {
    const agent = await getAgent()
    const { did } = await agent.createSpace(name)
    await agent.setCurrentSpace(did)
    setState('space', getCurrentSpace(agent))
  }

  const registerSpace = async (email: string): Promise<void> => {
    const agent = await getAgent()
    if (!state.space) throw new Error('create a space before registering')
    if (state.space.registered()) return // nothing to do

    const controller = new AbortController()
    setRegisterAbortController(controller)

    try {
      await agent.registerSpace(email, { signal: controller.signal })
      setState('space', getCurrentSpace(agent))
      setState('spaces', getSpaces(agent))
    } catch (err) {
      if (!controller.signal.aborted) {
        throw err
      }
    }
  }

  const setCurrentSpace = async (did: DID): Promise<void> => {
    const agent = await getAgent()
    await agent.setCurrentSpace(did)
    setState('space', getCurrentSpace(agent))
  }

  const loadAgent = async (): Promise<void> => {
    if (agent() != null) return
    await getAgent()
  }

  const unloadAgent = async (): Promise<void> => {
    setState('space', undefined)
    setState('spaces', [])
    setState('agent', undefined)
    setAgent(undefined)
  }

  const resetAgent = async (): Promise<void> => {
    const agent = await getAgent()
    await Promise.all([agent.store.reset(), unloadAgent()])
  }

  const getProofs = async (caps: Capability[]) => {
    const agent = await getAgent()
    return agent.proofs(caps)
  }

  const actions = {
    loadAgent,
    unloadAgent,
    resetAgent,
    createSpace,
    registerSpace,
    cancelRegisterSpace,
    setCurrentSpace,
    getProofs
  }

  return createComponent(AuthContext.Provider, {
    value: [state, actions],
    get children () {
      return props.children
    }
  })
}

/**
 * Use the scoped keyring context state from a parent KeyringProvider.
 */
export function useKeyring (): KeyringContextValue {
  return useContext(AuthContext)
}

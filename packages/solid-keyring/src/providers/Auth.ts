import { createContext, useContext, createSignal, createComponent, ParentComponent } from 'solid-js'
import { createStore } from 'solid-js/store'
import { createAgent, AuthStatus } from '@w3ui/keyring-core'
import type { Agent } from '@web3-storage/access'
import type { DID, Signer } from '@ucanto/interface'
import type { RSASigner } from '@ucanto/principal/rsa'

export interface AuthContextState {
  /**
   * The current user account.
   */
  readonly account?: DID
  /**
   * The current user agent (this device).
   */
  readonly agent?: DID
  /**
   * Signing authority from the agent that is able to issue UCAN invocations.
   */
  readonly issuer?: Signer
  /**
   * Authentication status of the current identity.
   */
  readonly status: AuthStatus
}

export type AuthContextValue = [
  state: AuthContextState,
  actions: {
    /**
     * Load the user agent and all stored data from secure storage.
     */
    loadAgent: () => Promise<void>
    /**
     * Unload the user agent and all stored data from secure storage. Note: this
     * does not remove data, use `resetAgent` if that is desired.
     */
    unloadAgent: () => Promise<void>
    /**
     * Unload the current account and agent from memory and remove from secure
     * storage. Note: this removes all data and is unrecoverable.
     */
    resetAgent: () => Promise<void>
    /**
     * Use a specific account.
     */
    selectAccount: (did: DID) => Promise<void>
    /**
     * Register a new account, verify the email address and store in secure
     * storage. Use cancelRegisterAccount to abort.
     */
    registerAccount: (email: string) => Promise<void>
    /**
     * Abort an ongoing account registration.
     */
    cancelRegisterAccount: () => void
  }
]

const defaultState: AuthContextState = {
  account: undefined,
  agent: undefined,
  issuer: undefined,
  status: AuthStatus.SignedOut
}

export const AuthContext = createContext<AuthContextValue>([
  defaultState,
  {
    loadAgent: async () => {},
    unloadAgent: async () => {},
    resetAgent: async () => {},
    selectAccount: async () => {},
    registerAccount: async () => {},
    cancelRegisterAccount: () => {}
  }
])

/**
 * Provider for authentication with the service.
 */
export const AuthProvider: ParentComponent = props => {
  const [state, setState] = createStore({
    account: defaultState.account,
    agent: defaultState.agent,
    issuer: defaultState.issuer,
    status: defaultState.status
  })

  const [agent, setAgent] = createSignal<Agent<RSASigner>>()
  const [registerAbortController, setRegisterAbortController] = createSignal<AbortController>()

  const getAgent = async (): Promise<Agent<RSASigner>> => {
    let a = agent()
    if (a == null) {
      a = await createAgent()
      setAgent(a)
      setState('agent', a.did())
      setState('issuer', a.issuer)
      const account = a.data.accounts.at(-1)
      if (account != null) {
        setState('account', account.did())
        setState('status', AuthStatus.SignedIn)
      }
    }
    return a
  }

  const cancelRegisterAccount = (): void => {
    const controller = registerAbortController()
    if (controller != null) {
      controller.abort()
    }
  }

  const registerAccount = async (email: string): Promise<void> => {
    const agent = await getAgent()
    const infos = await Promise.all(agent.data.accounts.map(a => agent.getAccountInfo(a.did())))
    const info = infos.find(i => i.email === email)
    if (info != null) {
      setState('account', info.did)
      setState('status', AuthStatus.SignedIn)
      return
    }

    const controller = new AbortController()
    setRegisterAbortController(controller)

    try {
      setState('status', AuthStatus.EmailVerification)
      await agent.createAccount(email, { signal: controller.signal })
      const account = agent.data.accounts.at(-1)
      setState('account', account?.did())
      setState('status', AuthStatus.SignedIn)
    } catch (err) {
      setState('status', AuthStatus.SignedOut)
      if (!controller.signal.aborted) {
        throw err
      }
    }
  }

  const selectAccount = async (did: DID): Promise<void> => {
    const agent = await getAgent()
    const account = agent.data.accounts.find(a => a.did() === did)
    if (account == null) throw new Error(`account not found: ${did}`)
    setState('account', account.did())
    setState('status', AuthStatus.SignedIn)
  }

  const loadAgent = async (): Promise<void> => {
    if (agent() != null) return
    await getAgent()
  }

  const unloadAgent = async (): Promise<void> => {
    setState('status', AuthStatus.SignedOut)
    setState('account', undefined)
    setState('issuer', undefined)
    setState('agent', undefined)
    setAgent(undefined)
  }

  const resetAgent = async (): Promise<void> => {
    const agent = await getAgent()
    await Promise.all([agent.store.reset(), unloadAgent()])
  }

  const actions = {
    loadAgent,
    unloadAgent,
    resetAgent,
    registerAccount,
    cancelRegisterAccount,
    selectAccount
  }

  return createComponent(AuthContext.Provider, {
    value: [state, actions],
    get children () {
      return props.children
    }
  })
}

/**
 * Use the scoped auth context state from a parent `AuthProvider`.
 */
export function useAuth (): AuthContextValue {
  return useContext(AuthContext)
}

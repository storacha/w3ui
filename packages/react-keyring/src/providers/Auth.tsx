import React, { createContext, useState, useContext, ReactNode } from 'react'
import { createAgent, AuthStatus } from '@w3ui/keyring-core'
import type { Agent } from '@web3-storage/access'
import type { DID, Signer } from '@ucanto/interface'
import type { RSASigner } from '@ucanto/principal/rsa'

export interface AuthContextValue {
  /**
   * The current user account.
   */
  account?: DID
  /**
   * The current user agent (this device).
   */
  agent?: DID
  /**
   * Signing authority from the agent that is able to issue UCAN invocations.
   */
  issuer?: Signer
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
  /**
   * Authentication status of the current account.
   */
  authStatus: AuthStatus
}

export const AuthContext = createContext<AuthContextValue>({
  account: undefined,
  agent: undefined,
  issuer: undefined,
  loadAgent: async () => {},
  unloadAgent: async () => {},
  resetAgent: async () => {},
  selectAccount: async () => {},
  registerAccount: async () => {},
  cancelRegisterAccount: () => {},
  authStatus: AuthStatus.SignedOut
})

export interface AuthProviderProps {
  children?: ReactNode
}

/**
 * Provider for authentication with the service.
 */
export function AuthProvider ({ children }: AuthProviderProps): ReactNode {
  const [agent, setAgent] = useState<Agent<RSASigner>>()
  const [authStatus, setAuthStatus] = useState(AuthStatus.SignedOut)
  const [accountDID, setAccountDID] = useState<DID>()
  const [agentDID, setAgentDID] = useState<DID>()
  const [issuer, setIssuer] = useState<Signer>()
  const [registerAbortController, setRegisterAbortController] = useState<AbortController>()

  const getAgent = async (): Promise<Agent<RSASigner>> => {
    if (agent == null) {
      const a = await createAgent()
      setAgent(a)
      setAgentDID(a.did())
      setIssuer(a.issuer)
      const account = a.data.accounts.at(-1)
      if (account != null) {
        setAccountDID(account.did())
        setAuthStatus(AuthStatus.SignedIn)
      }
      return a
    }
    return agent
  }

  const cancelRegisterAccount = (): void => {
    if (registerAbortController != null) {
      registerAbortController.abort()
    }
  }

  const registerAccount = async (email: string): Promise<void> => {
    const agent = await getAgent()
    const infos = await Promise.all(agent.data.accounts.map(async a => await agent.getAccountInfo(a.did())))
    const info = infos.find(i => i.email === email)
    if (info != null) {
      setAccountDID(info.did)
      setAuthStatus(AuthStatus.SignedIn)
      return
    }

    const controller = new AbortController()
    setRegisterAbortController(controller)

    try {
      setAuthStatus(AuthStatus.EmailVerification)
      await agent.createAccount(email, { signal: controller.signal })
      const account = agent.data.accounts.at(-1)
      setAccountDID(account?.did())
      setAuthStatus(AuthStatus.SignedIn)
    } catch (err) {
      setAuthStatus(AuthStatus.SignedOut)
      if (!controller.signal.aborted) {
        throw err
      }
    }
  }

  const selectAccount = async (did: DID): Promise<void> => {
    const agent = await getAgent()
    const account = agent.data.accounts.find(a => a.did() === did)
    if (account == null) throw new Error(`account not found: ${did}`)
    setAccountDID(account.did())
    setAuthStatus(AuthStatus.SignedIn)
  }

  const loadAgent = async (): Promise<void> => {
    if (agent != null) return
    await getAgent()
  }

  const unloadAgent = async (): Promise<void> => {
    setAuthStatus(AuthStatus.SignedOut)
    setAccountDID(undefined)
    setIssuer(undefined)
    setAgentDID(undefined)
    setAgent(undefined)
  }

  const resetAgent = async (): Promise<void> => {
    const agent = await getAgent()
    await Promise.all([agent.store.reset(), unloadAgent()])
  }

  const value = {
    authStatus,
    account: accountDID,
    agent: agentDID,
    issuer,
    loadAgent,
    unloadAgent,
    resetAgent,
    registerAccount,
    cancelRegisterAccount,
    selectAccount
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Use the scoped auth context state from a parent AuthProvider.
 */
export function useAuth (): AuthContextValue {
  return useContext(AuthContext)
}

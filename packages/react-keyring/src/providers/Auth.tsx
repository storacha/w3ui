import React, { createContext, useState, useContext, ReactNode } from 'react'
import { createAgent, Account, AuthStatus } from '@w3ui/keyring-core'
import type { Agent } from '@web3-storage/access'
import type { RSASigner } from '@ucanto/principal/rsa'

export interface AuthContextValue {
  /**
   * The current account
   */
  account?: Account
  /**
   * Load the default account from secure storage. If the account is not
   * verified, the registration flow will be automatically resumed.
   */
  loadDefaultAccount: () => Promise<void>
  /**
   * Unload the current account from memory.
   */
  unloadAccount: () => Promise<void>
  /**
   * Unload the current account from memory and remove from secure storage.
   */
  unloadAndRemoveAccount: () => Promise<void>
  /**
   * Register a new account, verify the email address and store in secure
   * storage. Use cancelRegisterAndStoreAccount to abort.
   */
  registerAndStoreAccount: (email: string) => Promise<void>
  /**
   * Abort an ongoing account registration.
   */
  cancelRegisterAndStoreAccount: () => void
  /**
   * Authentication status of the current account.
   */
  authStatus: AuthStatus
}

export const AuthContext = createContext<AuthContextValue>({
  account: undefined,
  loadDefaultAccount: async () => {},
  unloadAccount: async () => {},
  unloadAndRemoveAccount: async () => {},
  registerAndStoreAccount: async () => {},
  cancelRegisterAndStoreAccount: () => {},
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
  const [account, setAccount] = useState<Account>()
  const [registerAbortController, setRegisterAbortController] = useState<AbortController>()

  const getAgent = async (): Promise<Agent<Account>> => {
    if (agent == null) {
      const a = await createAgent()
      setAgent(a)
      return a
    }
    return agent
  }

  const load = async (): Promise<void> => {
    const agent = await getAgent()
    const account = agent.data.accounts.at(-1)
    if (account == null) {
      setAccount(account)
    }
  }

  const cancel = (): void => {
    if (registerAbortController != null) {
      registerAbortController.abort()
    }
  }

  const register = async (email: string): Promise<void> => {
    const agent = await getAgent()
    let acc: Account | undefined
    if (account != null) {
      let info
      try {
        info = await agent.getAccountInfo(account.did())
      } catch (err) {
        console.warn(err)
      }

      if (info != null) {
        if (info.email !== email) {
          throw new Error('unload current account before registering a new one')
        }
        setAuthStatus(AuthStatus.SignedIn)
        return
      }
    }

    const controller = new AbortController()
    setRegisterAbortController(controller)
    await agent.createAccount(email, { signal: controller.signal })
    acc = agent.data.accounts.at(-1)

    setAccount(acc)
    setAuthStatus(AuthStatus.SignedIn)
  }

  const verifyAndRegisterAndStore = async (unverifiedIdentity: UnverifiedIdentity): Promise<void> => {
    const controller = new AbortController()
    setRegisterAbortController(controller)

    try {
      setAuthStatus(AuthStatus.EmailVerification)

      const { identity, proof } = await waitIdentityVerification(unverifiedIdentity, { signal: controller.signal })
      await registerIdentity(identity, proof)
      await storeIdentity(identity)

      setIdentity(identity)
      setAuthStatus(AuthStatus.SignedIn)
    } catch (err) {
      setAuthStatus(AuthStatus.SignedOut)
      if (!controller.signal.aborted) {
        throw err
      }
    }
  }

  const unload = async (): Promise<void> => {
    setAuthStatus(AuthStatus.SignedOut)
    setIdentity(undefined)
  }

  const unloadAndRemove = async (): Promise<void> => {
    if (identity == null) {
      throw new Error('missing current identity')
    }
    await Promise.all([removeIdentity(identity), unload()])
  }

  const value = {
    authStatus,
    identity,
    loadDefaultIdentity: load,
    unloadIdentity: unload,
    unloadAndRemoveIdentity: unloadAndRemove,
    registerAndStoreIdentity: register,
    cancelRegisterAndStoreIdentity: cancel
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

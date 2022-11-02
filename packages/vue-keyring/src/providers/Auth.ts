import { defineComponent, provide, computed, InjectionKey, Ref, shallowReactive } from 'vue'
import { createAgent, AuthStatus } from '@w3ui/keyring-core'
import type { Agent } from '@web3-storage/access'
import type { DID, Signer } from '@ucanto/interface'
import type { RSASigner } from '@ucanto/principal/rsa'

/**
 * Injection keys for auth provider context.
 */
export const AuthProviderInjectionKey = {
  account: Symbol('w3ui keyring account') as InjectionKey<Ref<AuthContextState['account']>>,
  agent: Symbol('w3ui keyring agent') as InjectionKey<Ref<AuthContextState['agent']>>,
  issuer: Symbol('w3ui keyring issuer') as InjectionKey<Ref<AuthContextState['issuer']>>,
  status: Symbol('w3ui keyring auth status') as InjectionKey<Ref<AuthContextState['status']>>,
  loadAgent: Symbol('w3ui keyring loadAgent') as InjectionKey<AuthContextActions['loadAgent']>,
  unloadAgent: Symbol('w3ui keyring unloadAgent') as InjectionKey<AuthContextActions['unloadAgent']>,
  resetAgent: Symbol('w3ui keyring resetAgent') as InjectionKey<AuthContextActions['resetAgent']>,
  selectAccount: Symbol('w3ui keyring selectAccount') as InjectionKey<AuthContextActions['selectAccount']>,
  registerAccount: Symbol('w3ui keyring registerAccount') as InjectionKey<AuthContextActions['registerAccount']>,
  cancelRegisterAccount: Symbol('w3ui keyring cancelRegisterAccount') as InjectionKey<AuthContextActions['cancelRegisterAccount']>
}

export interface AuthContextState {
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
   * Authentication status of the current identity.
   */
  status: AuthStatus
}

export interface AuthContextActions {
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

/**
 * Provider for authentication with the service.
 */
export const AuthProvider = defineComponent({
  setup () {
    const state = shallowReactive<AuthContextState>({
      account: undefined,
      agent: undefined,
      issuer: undefined,
      status: AuthStatus.SignedOut
    })
    let agent: Agent<RSASigner>|undefined
    let registerAbortController: AbortController

    provide(AuthProviderInjectionKey.account, computed(() => state.account))
    provide(AuthProviderInjectionKey.agent, computed(() => state.agent))
    provide(AuthProviderInjectionKey.issuer, computed(() => state.issuer))
    provide(AuthProviderInjectionKey.status, computed(() => state.status))

    const getAgent = async (): Promise<Agent<RSASigner>> => {
      if (agent == null) {
        agent = await createAgent()
        state.agent = agent.did()
        state.issuer = agent.issuer
        const account = agent.data.accounts.at(-1)
        if (account != null) {
          state.account = account.did()
          state.status = AuthStatus.SignedIn
        }
      }
      return agent
    }

    provide(AuthProviderInjectionKey.cancelRegisterAccount, (): void => {
      if (registerAbortController != null) {
        registerAbortController.abort()
      }
    })

    provide(AuthProviderInjectionKey.registerAccount, async (email: string): Promise<void> => {
      const agent = await getAgent()
      const infos = await Promise.all(agent.data.accounts.map(a => agent.getAccountInfo(a.did())))
      const info = infos.find(i => i.email === email)
      if (info != null) {
        state.account = info.did
        state.status = AuthStatus.SignedIn
        return
      }

      const controller = new AbortController()
      registerAbortController = controller

      try {
        state.status = AuthStatus.EmailVerification
        await agent.createAccount(email, { signal: controller.signal })
        const account = agent.data.accounts.at(-1)
        state.account = account?.did()
        state.status = AuthStatus.SignedIn
      } catch (err) {
        state.status = AuthStatus.SignedOut
        if (!controller.signal.aborted) {
          throw err
        }
      }
    })

    provide(AuthProviderInjectionKey.selectAccount, async (did: DID): Promise<void> => {
      const agent = await getAgent()
      const account = agent.data.accounts.find(a => a.did() === did)
      if (account == null) throw new Error(`account not found: ${did}`)
      state.account = account.did()
      state.status = AuthStatus.SignedIn
    })

    const loadAgent = async (): Promise<void> => {
      if (agent != null) return
      await getAgent()
    }
    provide(AuthProviderInjectionKey.loadAgent, loadAgent)

    const unloadAgent = async (): Promise<void> => {
      state.status = AuthStatus.SignedOut
      state.account = undefined
      state.issuer = undefined
      state.agent = undefined
      agent = undefined
    }
    provide(AuthProviderInjectionKey.unloadAgent, unloadAgent)

    provide(AuthProviderInjectionKey.resetAgent, async (): Promise<void> => {
      const agent = await getAgent()
      await Promise.all([agent.store.reset(), unloadAgent()])
    })

    // void loadAgent()

    return state
  },

  // Our provider component is a renderless component
  // it does not render any markup of its own.
  render () {
    // @ts-expect-error
    return this.$slots.default()
  }
})

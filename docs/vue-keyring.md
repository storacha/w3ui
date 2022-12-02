# `@w3ui/vue-keyring`

## Install

```sh
npm install @w3ui/vue-keyring
```

## Usage

```js
import * as VueKeyring from '@w3ui/vue-keyring'
```

## Exports

* [`AuthProvider`](#authprovider)

---

### `AuthProvider`

[Provider](https://vuejs.org/guide/components/provide-inject.html) for authentication with the service.

Example:

```vue
<script>
import { AuthProvider } from '@w3ui/vue-keyring'

export default {
  components: { AuthProvider }
}
</script>

<template>
  <AuthProvider>
    <!-- Application pages/components -->
  </AuthProvider>
</template>
```

Once mounted, the `AuthProvider` provides the following injection keys:

```ts
type AuthProviderInjectionKey = {
  account: InjectionKey<Ref<AuthContextState['account']>>
  agent: InjectionKey<Ref<AuthContextState['agent']>>
  issuer: InjectionKey<Ref<AuthContextState['issuer']>>
  status: InjectionKey<Ref<AuthContextState['status']>>
  loadAgent: InjectionKey<AuthContextActions['loadAgent']>
  unloadAgent: InjectionKey<AuthContextActions['unloadAgent']>
  resetAgent: InjectionKey<AuthContextActions['resetAgent']>
  selectAccount: InjectionKey<AuthContextActions['selectAccount']>
  registerAccount: InjectionKey<AuthContextActions['registerAccount']>
  cancelRegisterAccount: InjectionKey<AuthContextActions['cancelRegisterAccount']>
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
```

These keys may be used in child components e.g.

```vue
<script>
import { AuthProviderInjectionKey } from '@w3ui/vue-keyring'

export default {
  inject: {
    identity: { from: AuthProviderInjectionKey.identity }
  }
}
</script>

<template>
  <p v-if="identity != null">{{identity.email}}</p>
</template>
```

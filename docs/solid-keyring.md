# `@w3ui/solid-keyring`

## Install

```sh
npm install @w3ui/solid-keyring
```

## Usage

```js
import * as SolidKeyring from '@w3ui/solid-keyring'
```

## Exports

* [`AuthProvider`](#authprovider)
* [`useAuth`](#useauth)

---

### `AuthProvider`

Provider for authentication with the service.

Example:

```jsx
import { AuthProvider } from '@w3ui/solid-keyring'

function App () {
  return (
    <AuthProvider>
      {/* Application pages/components */}
    </AuthProvider>
  )
}
```

### `useAuth`

```ts
const [state, actions] = useAuth()
```

Hook to allow use of the [`AuthProvider`](#authprovider) value. The value returned is an `AuthContextValue`:

```ts
interface AuthContextState {
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

type AuthContextValue = [
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
```

# `@w3ui/keyring-core`

## Install

```sh
npm install @w3ui/keyring-core
```

## Usage

```js
import * as KeyringCore from '@w3ui/keyring-core'
```

## Exports

* [`createAgent`](#createagent)

---

### `createAgent`

```ts
createAgent (options: { url?: URL } = {}): Promise<Agent<RSASigner>> 
```

Create the user agent and load account information from secure storage.

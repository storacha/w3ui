import { Agent } from '@web3-storage/access'
import { StoreIndexedDB } from '@web3-storage/access/stores/store-indexeddb'
import type { RSASigner } from '@ucanto/principal/rsa'

export enum AuthStatus {
  /**
   * Account/agent loaded.
   */
  SignedIn,
  /**
   * Not authorized.
   */
  SignedOut,
  /**
   * Email verification email has been sent.
   */
  EmailVerification
}

const DB_NAME = 'w3ui'
const DB_STORE_NAME = 'keyring'

/**
 * Create an agent for managing identity. It uses RSA keys that are stored in
 * IndexedDB as unextractable `CryptoKey`s.
 */
export async function createAgent (options: { url?: URL } = {}): Promise<Agent<RSASigner>> {
  const store = await StoreIndexedDB.create(DB_NAME, { dbVersion: 1, dbStoreName: DB_STORE_NAME })
  return await Agent.create({ store, ...options })
}

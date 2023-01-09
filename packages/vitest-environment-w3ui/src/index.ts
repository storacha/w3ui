import crypto from 'crypto'
import { builtinEnvironments } from 'vitest/environments'
import type { Environment } from 'vitest'

export default <Environment> {
  name: 'w3ui',
  async setup(global, options) {

    // use the standard jsdom environment as a base
    const jsdom = await builtinEnvironments.jsdom.setup(global, options)

    // `crypto` is defined as a getter on the global scope in Node 19+,
    // so attempting to set it with `Object.assign()` would fail. Instead,
    // override the getter with a new value.   
    Object.defineProperty(global, "crypto", { get: () => crypto.webcrypto });   

    return {
      teardown(global) {
        jsdom.teardown(global)
      }
    }
  }
}
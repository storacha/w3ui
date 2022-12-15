import React, {
  useState, createContext, useContext, useCallback, useMemo
} from 'react'
import { useKeyring, KeyringContextState, KeyringContextActions } from '@w3ui/react-keyring'

export type AuthenticatorContextState = KeyringContextState & {
  email?: string
  submitted: boolean
  handleRegisterSubmit?: (e: React.FormEvent<HTMLFormElement>) => Promise<void>
}

export type AuthenticatorContextActions = KeyringContextActions & {
  setEmail: React.Dispatch<React.SetStateAction<string>>
}

export type AuthenticatorContextValue = [
  state: AuthenticatorContextState,
  actions: AuthenticatorContextActions
]

export const AuthenticatorContext = createContext<AuthenticatorContextValue>([
  {
    spaces: [],
    submitted: false
  },
  {
    setEmail: () => { throw new Error('missing set email function') },
    loadAgent: async () => { },
    unloadAgent: async () => { },
    resetAgent: async () => { },
    createSpace: async () => { throw new Error('missing keyring context provider') },
    setCurrentSpace: async () => { },
    registerSpace: async () => { },
    cancelRegisterSpace: () => { },
    getProofs: async () => []
  }
])

export function Authenticator (props: any): JSX.Element {
  const [state, actions] = useKeyring()
  const { createSpace, registerSpace } = actions
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleRegisterSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitted(true)
    try {
      await createSpace()
      await registerSpace(email)
    } catch (err: any) {
      throw new Error('failed to register')
    } finally {
      setSubmitted(false)
    }
  }, [setSubmitted, createSpace, registerSpace])

  const value = useMemo<AuthenticatorContextValue>(() => [
    { ...state, email, submitted, handleRegisterSubmit },
    { ...actions, setEmail }
  ], [state, actions, email, submitted, handleRegisterSubmit])
  return (
    <AuthenticatorContext.Provider value={value} {...props} />
  )
}

Authenticator.Form = function Form (props: any) {
  const [{ handleRegisterSubmit }] = useAuthenticator()
  return (
    <form onSubmit={handleRegisterSubmit} {...props} />
  )
}

Authenticator.EmailInput = function EmailInput (props: any) {
  const [{ email }, { setEmail }] = useAuthenticator()
  return (
    <input type='email' value={email} onChange={e => setEmail(e.target.value)} {...props} />
  )
}

Authenticator.CancelButton = function CancelButton (props: any) {
  const [, { cancelRegisterSpace }] = useAuthenticator()
  return (
    <button onClick={() => { cancelRegisterSpace() }} {...props} />
  )
}

export function useAuthenticator (): AuthenticatorContextValue {
  return useContext(AuthenticatorContext)
}

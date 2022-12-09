import React from 'react'
import { Authenticator, useAuthenticator } from '@w3ui/react-keyring'

export function AuthenticationForm() {
  const [{ submitted }] = useAuthenticator()

  return (
    <Authenticator.Form className="w3ui-simple-authenticator-form">
      <div className="email-field">
        <label htmlFor='w3ui-simple-authenticator-email'>Email address:</label>
        <Authenticator.EmailInput id='w3ui-simple-authenticator-email' required />
      </div>
      <button className="register" type='submit' disabled={submitted}>Register</button>
    </Authenticator.Form>
  )
}

export function AuthenticationSubmitted() {
  const [{ email }] = useAuthenticator()

  return (
    <div className="w3ui-simple-authenticator-verify-email">
      <h1 className="message">Verify your email address!</h1>
      <p className="detail">Click the link in the email we sent to {email} to sign in.</p>
      <Authenticator.CancelButton className="cancel">
        Cancel
      </Authenticator.CancelButton>
    </div>
  )
}

export function AuthenticationEnsurer({ children }: { children: JSX.Element }) {
  const [{ space, submitted }] = useAuthenticator()
  if (space?.registered()) {
    return children
  } else if (submitted) {
    return <AuthenticationSubmitted />
  } else {
    return <AuthenticationForm />
  }
}

type SimpleAuthenticatorProps = {
  children: JSX.Element
}

export function SimpleAuthenticator({ children }: SimpleAuthenticatorProps) {
  return (
    <Authenticator>
      <AuthenticationEnsurer children={children} />
    </Authenticator>
  )
}

/**
 * Wrapping a component with this HoC ensures an identity exists.
 */
export function withIdentity<C extends React.JSXElementConstructor<P>, P>(Component: C) {
  return (props: any) => (
    <SimpleAuthenticator>
      <Component {...props} />
    </SimpleAuthenticator>
  )
}

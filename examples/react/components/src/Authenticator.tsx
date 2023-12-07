import React, { ReactNode } from 'react'
import { Authenticator, useAuthenticator } from '@w3ui/react'
import { Loader } from './Loader'

export function AuthenticationForm (): ReactNode {
  const [{ submitted }] = useAuthenticator()
  return (
    <div>
      <Authenticator.Form>
        <div>
          <label htmlFor='authenticator-email'>Email address:</label>
          <Authenticator.EmailInput id='authenticator-email' required />
        </div>
        <div>
          <button type='submit' disabled={submitted}>
            Authorize
          </button>
        </div>
      </Authenticator.Form>
    </div >
  )
}

export function AuthenticationSubmitted (): ReactNode {
  const [{ email }] = useAuthenticator()
  return (
    <div className='authenticator'>
      <div className='text-zinc-950 bg-grad rounded-xl shadow-md px-10 pt-8 pb-8'>
        <h1 className='text-xl font-semibold'>Verify your email address!</h1>
        <p className='pt-2 pb-4'>
          Click the link in the email we sent to <span className='font-semibold tracking-wide'>{email}</span> to authorize this agent.
        </p>
        <Authenticator.CancelButton className='inline-block bg-zinc-950 hover:outline text-white font-bold text-sm px-6 py-2 rounded-full whitespace-nowrap' >
          Cancel
        </Authenticator.CancelButton>
      </div>
    </div>
  )
}

export function AuthenticationEnsurer ({ children }: { children: ReactNode }): ReactNode {
  const [{ submitted, accounts, client }] = useAuthenticator()
  const authenticated = accounts.length > 0
  if (authenticated) {
    return <>{children}</>
  }
  if (submitted) {
    return <AuthenticationSubmitted />
  }
  if (client != null) {
    return <AuthenticationForm />
  }
  return <Loader />
}

import React, { useEffect, useState } from 'react'
import { useKeyring } from '@w3ui/react-keyring'

export default function ContentPage () {
  const [{ space }, { loadAgent, unloadAgent, createSpace, registerSpace, cancelRegisterSpace }] = useKeyring()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  // eslint-disable-next-line
  useEffect(() => { loadAgent() }, []) // load the agent - once.

  if (space?.registered()) {
    return (
      <div className='w3ui-signUpIn__success'>
        <h1 className='w3ui-h1'>Welcome!</h1>
        <p className='w3ui-p'>You are logged in!!</p>
        <form onSubmit={e => { e.preventDefault(); unloadAgent() }}>
          <button type='submit' className='w3ui-button w3ui-submit'>Sign Out</button>
        </form>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className='w3ui-signUpIn__verify'>
        <h1 className='w3ui-h1'>Verify your email address!</h1>
        <p className='w3ui-p'>Click the link in the email we sent to {email} to sign in.</p>
        <form onSubmit={e => { e.preventDefault(); cancelRegisterSpace() }}>
          <button type='submit' className='w3ui-button w3ui-submit'>Cancel</button>
        </form>
      </div>
    )
  }

  const handleRegisterSubmit = async e => {
    e.preventDefault()
    setSubmitted(true)
    try {
      await createSpace()
      await registerSpace(email)
    } catch (err) {
      throw new Error('failed to register', { cause: err })
    } finally {
      setSubmitted(false)
    }
  }

  return (
    <div className='w3ui-signUpIn__login'>
      <form onSubmit={handleRegisterSubmit} className='w3ui-signUpIn__form'>
        <div className='w3ui-signUpIn__field'>
          <label htmlFor='email' className='w3ui-signUpIn__label w3ui-label'>Email address:</label>
          <input id='email' className='w3ui-signUpIn__input w3ui-input' type='email' value={email} onChange={e => setEmail(e.target.value)} required placeholder='youremail@address.com' />
        </div>
        <button type='submit' className='w3ui-button w3ui-submit' disabled={submitted}>Register</button>
      </form>
    </div>
  )
}

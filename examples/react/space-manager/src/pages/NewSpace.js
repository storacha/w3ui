import React, { useState } from 'react'
import { useKeyring } from '@w3ui/react-keyring'
import { useNavigate } from 'react-router-dom'
import { PanelPage } from '../components/Panel'

export function NewSpacePage () {
  const navigate = useNavigate()
  const [, { createSpace, registerSpace, cancelRegisterSpace }] = useKeyring()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [named, setNamed] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <PanelPage title='Verify your email address!'>
        <p className='tc'>Click the link in the email we sent to {email}.</p>
        <form onSubmit={e => { e.preventDefault(); cancelRegisterSpace() }}>
          <div className='tc'>
            <button type='submit' className='input-reset pointer near-white pv3 ph4 bg-transparent b--transparent hover-bg-white-10 br2'>Cancel</button>
          </div>
        </form>
      </PanelPage>
    )
  }

  if (named) {
    const handleRegisterSubmit = async e => {
      e.preventDefault()
      setSubmitted(true)
      try {
        const did = await createSpace(name)
        await registerSpace(email)
        navigate(`/space/${did}`)
      } catch (err) {
        console.log(err)
        throw new Error('failed to register', { cause: err })
      } finally {
        setSubmitted(false)
      }
    }

    return (
      <PanelPage title='Verify space'>
        <form onSubmit={handleRegisterSubmit}>
          <p>Verify your email address to start using your space.</p>
          <div className='mb3'>
            <label htmlFor='email' className='db mb2'>Email:</label>
            <input id='email' className='db pa2 w-100' type='email' value={email} onChange={e => setEmail(e.target.value)} required placeholder='you@email.com' />
          </div>
          <div className='tc'>
            <button type='submit' className='input-reset pointer near-white pv3 ph4 bg-transparent b--transparent hover-bg-white-10 br2' disabled={submitted}>Verify</button>
          </div>
        </form>
      </PanelPage>
    )
  }

  return (
    <PanelPage title='New space'>
      <form onSubmit={async e => { e.preventDefault(); setNamed(true) }}>
        <div className='mb3'>
          <label htmlFor='name' className='db mb2'>Name:</label>
          <input id='name' className='db pa2 w-100 border-box' value={name} onChange={e => setName(e.target.value)} required placeholder='e.g. Pictures, Videos, Documents' />
        </div>
        <div className='tc'>
          <button type='submit' className='input-reset pointer near-white pv3 ph4 bg-transparent b--transparent hover-bg-white-10 br2' disabled={named}>Next</button>
        </div>
      </form>
    </PanelPage>
  )
}

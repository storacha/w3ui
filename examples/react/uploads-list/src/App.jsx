import React, { useEffect } from 'react'
import { KeyringProvider, useKeyring } from '@w3ui/react-keyring'
import { UploadsListProvider } from '@w3ui/react-uploads-list'
import ContentPage from './ContentPage'
import logo from './logo.png'
import './style.css'

function App () {
  return (
    <KeyringProvider>
      <IdentityLoader>
        <UploadsListProvider>
          <div className='w3ui-app'>
            <header>
              <img src={logo} width='250' alt='logo' />
            </header>
            <ContentPage />
          </div>
        </UploadsListProvider>
      </IdentityLoader>
    </KeyringProvider>
  )
}

function IdentityLoader ({ children }) {
  const [, { loadAgent }] = useKeyring()
  // eslint-disable-next-line
  useEffect(() => { loadAgent() }, []) // try load default identity - once.
  return children
}

export default App

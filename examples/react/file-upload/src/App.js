import React, { useEffect } from 'react'
import { AuthProvider, useAuth } from '@w3ui/react-wallet'
import { UploaderProvider } from '@w3ui/react-uploader'
import { UploadsListProvider } from '@w3ui/react-uploads-list'

import ContentPage from './ContentPage'
import logo from './logo.png'

function App () {
  return (
    <AuthProvider>
      <UploaderProvider>
        <UploadsListProvider>
          <IdentityLoader>
            <div className='flex flex-column justify-center items-center sans-serif light-silver'>
              <header>
                <img src={logo} width='250' alt='logo' />
              </header>
              <div className='w-90 w-50-ns mw6'>
                <ContentPage />
              </div>
            </div>
          </IdentityLoader>
        </UploadsListProvider>
      </UploaderProvider>
    </AuthProvider>
  )
}

function IdentityLoader ({ children }) {
  const { loadDefaultIdentity } = useAuth()
  // eslint-disable-next-line
  useEffect(() => { loadDefaultIdentity() }, []) // try load default identity - once.
  return children
}

export default App

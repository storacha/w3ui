import React, { useEffect } from 'react'
import { AuthProvider, useAuth } from '@w3ui/react-keyring'
import { UploaderProvider } from '@w3ui/react-uploader'
import ContentPage from './ContentPage'
import logo from './logo.png'
import './style.css'

function App() {
  return (
    <AuthProvider>
      <UploaderProvider>
        <IdentityLoader>
          <div className="w3ui-app">
            <header>
              <img src={logo} width='250' alt='logo' />
            </header>
            <div>
              <ContentPage />
            </div>
          </div>
        </IdentityLoader>
      </UploaderProvider>
    </AuthProvider>
  )
}

function IdentityLoader({ children }) {
  const { loadDefaultIdentity } = useAuth()
  // eslint-disable-next-line
  useEffect(() => { loadDefaultIdentity() }, []) // try load default identity - once.
  return children
}

export default App

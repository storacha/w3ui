import React from 'react'
import { KeyringProvider } from '@w3ui/react-keyring'
import ContentPage from './ContentPage'
import logo from './logo.png'
import './style.css'

function App () {
  return (
    <KeyringProvider>
      <div className='w3ui-app'>
        <header>
          <img src={logo} width='250' alt='logo' />
        </header>
        <div className='w3ui-signUpIn-container'>
          <ContentPage />
        </div>
      </div>
    </KeyringProvider>
  )
}

export default App

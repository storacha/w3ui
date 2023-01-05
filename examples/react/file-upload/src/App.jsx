import React from 'react'
import { W3APIProvider } from '@w3ui/react-ui'
import ContentPage from './ContentPage'
import logo from './logo.png'

function App () {
  return (
    <W3APIProvider>
      <div className='vh-100 flex flex-column justify-center items-center sans-serif light-silver'>
        <header>
          <img src={logo} width='250' alt='logo' />
        </header>
        <div className='w-90 w-50-ns mw6'>
          <ContentPage />
        </div>
      </div>
    </W3APIProvider>
  )
}

export default App
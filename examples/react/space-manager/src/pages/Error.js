import React from 'react'
import { NavbarPage } from '../components/Navbar'

export const ErrorPage = ({ error, space }) => (
  <NavbarPage space={space}>
    <div>
      <h1 className='near-white'>⚠️ Error: {error.message}</h1>
      <p>Check the browser console for details.</p>
    </div>
  </NavbarPage>
)

import React from 'react'
import { KeyringProvider } from '@w3ui/react-keyring'
import { UploaderProvider } from '@w3ui/react-uploader'
import { UploadsListProvider } from '@w3ui/react-uploads-list'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { HomePage } from './pages/Home'
import { UploadPage } from './pages/Upload'
import { SpaceSelectPage } from './pages/SpaceSelect'
import { NewSpacePage } from './pages/NewSpace'
import { SpacePage } from './pages/Space'

import {
  accessServicePrincipal,
  accessServiceConnection,
  uploadServicePrincipal,
  uploadServiceConnection
} from './staging-service.js'

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />
  },
  {
    path: '/space/select',
    element: <SpaceSelectPage />
  },
  {
    path: '/space/new',
    element: <NewSpacePage />
  },
  {
    path: '/space/:did',
    element: <SpacePage />
  },
  {
    path: '/upload',
    element: <UploadPage />
  }
])

function App () {
  return (
    <KeyringProvider servicePrincipal={accessServicePrincipal} connection={accessServiceConnection}>
      <UploaderProvider servicePrincipal={uploadServicePrincipal} connection={uploadServiceConnection}>
        <UploadsListProvider servicePrincipal={uploadServicePrincipal} connection={uploadServiceConnection}>
          <RouterProvider router={router} />
        </UploadsListProvider>
      </UploaderProvider>
    </KeyringProvider>
  )
}

export default App

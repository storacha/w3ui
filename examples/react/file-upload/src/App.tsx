import { Authenticator, Provider, Uploader } from '@w3ui/react'
import { AuthenticationEnsurer, SpaceEnsurer, UploaderForm } from '@w3ui/example-react-components'
import React from 'react'

function App () {
  return (
    <Provider>
      <Authenticator>
        <AuthenticationEnsurer>
          <SpaceEnsurer>
            <Uploader>
              <UploaderForm />
            </Uploader>
          </SpaceEnsurer>
        </AuthenticationEnsurer>
      </Authenticator>
    </Provider>
  )
}

export default App

import { Authenticator, Provider, Uploader, useW3 } from '@w3ui/react'
import { AuthenticationEnsurer, Loader, UploaderForm } from '@w3ui/example-react-components'
import React, { useEffect } from 'react'

function SpaceEnsurer ({ children }) {
  const [{ client }] = useW3()
  useEffect(function () {
    async function ensureCurrentSpace () {
      if (client && !client.currentSpace()) {
        client.setCurrentSpace(
          client.spaces().length > 0 ? (
            client.spaces()[0].did()
          ) : (
            await client.createSpace("example space")
          )
        )
      }
    }
    ensureCurrentSpace()
  }, [client])

  if (client) {
    return children
  } else {
    return <Loader />
  }
}

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

import { Authenticator, Provider, useW3 } from '@w3ui/react'
import { AuthenticationEnsurer } from '@w3ui/example-react-components'
import React from 'react'

function Identity () {
  const [{ client, accounts }] = useW3()
  return (
    <div>
      <p>
        You're signed in as {accounts[0].toEmail()}.
      </p>
      <p>
        Your local agent's DID is {client?.agent.did()}
      </p>
    </div>
  )
}

function App () {
  return (
    <Provider>
      <Authenticator>
        <AuthenticationEnsurer>
          <Identity />
        </AuthenticationEnsurer>
      </Authenticator>
    </Provider>
  )
}

export default App

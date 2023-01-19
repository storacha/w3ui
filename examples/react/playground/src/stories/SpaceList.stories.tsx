import { Space } from '@w3ui/keyring-core'
import type { DID } from '@ucanto/interface'

import React from 'react'
import { SpaceList } from '@w3ui/react'
import { KeyringContext, keyringContextDefaultValue } from '@w3ui/react-keyring'

function contextValue (state = {}, actions = {}) {
  return [
    { ...keyringContextDefaultValue[0], ...state },
    { ...keyringContextDefaultValue[1], ...actions }
  ]
}

function WrappedSpaceList ({ spaceDIDs = [], setCurrentSpace }: { spaceDIDs: DID[], setCurrentSpace: any }) {
  const spaces = spaceDIDs.map(did => new Space(did, {}))
  return (
    <KeyringContext.Provider value={contextValue({ spaces }, { setCurrentSpace })}>
      <SpaceList />
    </KeyringContext.Provider>
  )
}

export default {
  title: 'w3ui/SpaceList',
  component: WrappedSpaceList,
  tags: ['autodocs'],
  argTypes: {
    setCurrentSpace: { action: 'set space' }
  }
}

export const Primary = {
  args: {
    spaceDIDs: ['did:example:abc123']
  }
}

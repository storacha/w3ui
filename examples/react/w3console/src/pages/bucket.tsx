
import { useState } from 'react'
import { DIDKey } from '@ucanto/interface'
import { useKeyring } from '@w3ui/react-keyring'

import { AuthenticationEnsurer } from '../components/Authenticator'
import { DefaultLayout } from '../components/Layout'
import { SpaceEnsurer } from '../components/SpaceEnsurer'
import { BucketSection } from '../components/BucketSection'
import { SpaceSelector } from './SpaceSelector'
import Modules from '../components/Modules'
import { BucketProvider } from '../providers/BucketProvider'

export default function Bucket (): JSX.Element {
  const [share, setShare] = useState(false)
  const [{ space, spaces }, { setCurrentSpace }] = useKeyring()

  function viewSpace (did: DIDKey): void {
    setShare(false)
    void setCurrentSpace(did)
  }

  return (
    <AuthenticationEnsurer>
      <SpaceEnsurer>
        <BucketProvider>
          <DefaultLayout sidebar={
            <div class='flex-grow flex flex-col'>
              <SpaceSelector
                selected={space}
                setSelected={viewSpace}
                spaces={spaces}
              />
              <div className='pt-4'>
                <Modules />
              </div>
            </div>
          }>
            <BucketSection viewSpace={viewSpace} share={share} setShare={setShare} />
          </DefaultLayout>
        </BucketProvider>
      </SpaceEnsurer>
    </AuthenticationEnsurer>
  )
}


import React, { useEffect } from 'react'
import { useKeyring } from '@w3ui/react-keyring'
import { useNavigate } from 'react-router-dom'
import { PanelPage } from '../components/Panel'

export function HomePage () {
  const [{ agent, space }, { loadAgent }] = useKeyring()
  const navigate = useNavigate()
  useEffect(() => {
    if (!agent) {
      loadAgent()
      return
    }
    navigate(space ? `/space/${space.did()}` : '/space/select')
  }, [agent, space])
  return <PanelPage title='Loading'><div className='f2 tc'>⏳</div></PanelPage>
}

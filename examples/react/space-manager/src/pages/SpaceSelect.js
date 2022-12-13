import React from 'react'
import { useKeyring } from '@w3ui/react-keyring'
import { useNavigate } from 'react-router-dom'
import md5 from 'blueimp-md5'
import { PanelPage } from '../components/Panel'

export function SpaceSelectPage () {
  const navigate = useNavigate()
  const [{ agent, spaces }, { loadAgent }] = useKeyring()

  if (!agent) {
    loadAgent()
    return null
  }

  const handleNewSpaceSubmit = e => {
    e.preventDefault()
    navigate('/space/new')
  }
  const handleSpaceSelectSubmit = e => {
    e.preventDefault()
    navigate(`/space/${e.currentTarget.dataset.space}`)
  }

  return (
    <PanelPage title='Choose space:'>
      <ul className='list ph0 overflow-y-scroll' style={{ maxHeight: 330 }}>
        {spaces.filter(s => s.registered()).map((s, i) => (
          <li key={s.did()} className={`${i ? 'bt' : ''} b--dark-gray`}>
            <form data-space={s.did()} onSubmit={handleSpaceSelectSubmit}>
              <button type='submit' className='input-reset pointer bg-transparent bw0 near-white hover-bg-white-10 pa3 flex w-100'>
                <div>
                  <img src={`https://www.gravatar.com/avatar/${md5(s.did())}?d=identicon`} width='45' className='ba br2 mr3' />
                </div>
                <div className='tl'>
                  <div className='lh-copy'>{s.name()}</div>
                  <div className='lh-copy white-50 f6'>{s.did()}</div>
                </div>
              </button>
            </form>
          </li>
        ))}
      </ul>
      <form onSubmit={handleNewSpaceSubmit} className='tc ma3'>
        <button type='submit' className='input-reset pointer near-white pv3 ph4 bg-transparent b--transparent hover-bg-white-10 br2'>+ New Space</button>
      </form>
    </PanelPage>
  )
}

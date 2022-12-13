import React, { useEffect } from 'react'
import { useKeyring } from '@w3ui/react-keyring'
import { useUploadsList } from '@w3ui/react-uploads-list'
import { useNavigate, useParams } from 'react-router-dom'
import * as DID from '@ipld/dag-ucan/did'
import { NavbarPage } from '../components/Navbar'
import { ErrorPage } from './Error'

export function SpacePage () {
  const navigate = useNavigate()
  const { did } = useParams()
  const [{ space }, { setCurrentSpace }] = useKeyring()
  const [{ loading, error, data }, { next, reload }] = useUploadsList()

  useEffect(() => { if (space && space.did() === String(did)) reload() }, [space])

  if (!space || space.did() !== String(did)) {
    (async () => {
      try {
        const spacePrincipal = DID.parse(String(did))
        await setCurrentSpace(spacePrincipal.did())
      } catch (err) {
        console.error(err)
        navigate('/space/select')
      }
    })()
    return <p>Space not found</p>
  }

  if (error) return <ErrorPage space={space} error={error} />

  if (loading) {
    return (
      <NavbarPage space={space}>
        <h1 className='near-white tc normal mv5'>⏳ Loading...</h1>
      </NavbarPage>
    )
  }

  const handleUploadCtaSubmit = e => {
    e.preventDefault()
    navigate('/upload')
  }

  return (
    <NavbarPage space={space}>
      {data?.length
        ? (
          <>
            <div className='overflow-auto'>
              <table className='w-100 mt5 mb3 collapse'>
                <thead className='near-white tl'>
                  <tr>
                    <th className='pa3'>Root</th>
                    <th className='pa3'>Shard(s)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map(({ root, shards }) => (
                    <tr key={String(root)} className='stripe-light'>
                      <td className='pa3 v-top'>
                        {String(root)} <a href={`https://w3s.link/ipfs/${String(root)}`} className='white no-underline'>↗</a>
                      </td>
                      <td className='pa3'>
                        {(shards || []).map(s => <div key={String(s)}>{String(s)}</div>)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type='button' onClick={reload} className='ph3 pv2 mr3'>Refresh</button>
            <button type='button' onClick={next} className='ph3 pv2 mr3'>Next</button>
          </>
          )
        : (
          <>
            <h1 className='near-white tc normal mt5 mb4'>No uploads yet!</h1>
            <form className='tc' onSubmit={handleUploadCtaSubmit}>
              <button type='submit' className='input-reset pointer near-white pv3 ph4 bg-transparent b--transparent hover-bg-white-10 br2'>↑ Upload a file</button>
            </form>
          </>
          )}
    </NavbarPage>
  )
}

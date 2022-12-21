import React, { useEffect } from 'react'
import { useUploadsList } from '@w3ui/react-uploads-list'
import { withIdentity } from './components/Authenticator'
import './spinner.css'

export function ContentPage () {
  const [{ loading, error, data }, { next, reload }] = useUploadsList()
  useEffect(() => {
    next()
    // we really only want to run this once so leave the deps list empty
  }, [])
  if (error) {
    return <Errored error={error} />
  }

  return (
    <div className={`w3ui-uploadsList-container ${loading && 'w3ui-refreshing'}`}>
      {data && data.length
        ? (
          <div className='w3ui-table-container'>
            <table className='w3ui-table'>
              <thead className='w3ui-table_thead'>
                <tr>
                  <th className='w3ui-table_th'>Upload CID</th>
                </tr>
              </thead>
              <tbody>
                {data.map(({ root }) => (
                  <tr key={root.toString()} className='w3ui-table_tr'>
                    <td className='w3ui-table_td'>{root.toString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )
        : <p className='w3ui-table-empty-message'>No uploads</p>}
      <button type='button' onClick={reload} className='w3ui-button w3ui-refresh'>
        {loading ? 'Refreshing...' : 'Refresh'}
      </button>
    </div>
  )
}

const Errored = ({ error }) => (
  <div className='w3ui-uploadsList-container w3ui-error'>
    <h1 className='w3ui-error-header'>⚠️ Error: {error.message}</h1>
    <p>Check the browser console for details.</p>
  </div>
)

export default withIdentity(ContentPage)

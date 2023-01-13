import type { UploadListResult } from '@w3ui/uploads-list-core'
import React from 'react'
import { UploadsList } from '@w3ui/react-uploads-list'

function Uploads ({ uploads }: { uploads?: UploadListResult[] }): JSX.Element {
  if ((uploads === undefined) || (uploads.length === 0)) {
    return (
      <>
        <div>
          <div>
            No uploads
          </div>
          <nav>
            <UploadsList.ReloadButton className='reload w3ui-button'>
              Reload
            </UploadsList.ReloadButton>
          </nav>
        </div>
      </>
    )
  } else {
    return (
      <>
        <div className='w3-uploads-list-data'>
          <table>
            <thead>
              <tr>
                <th>Root CID</th>
              </tr>
            </thead>
            <tbody>
              {uploads.map(({ root }) => (
                <tr key={root.toString()}>
                  <td>{root.toString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <nav>
          <UploadsList.NextButton className='next w3ui-button'>
            Next
          </UploadsList.NextButton>
          <UploadsList.ReloadButton className='reload w3ui-button'>
            Reload
          </UploadsList.ReloadButton>
        </nav>
      </>
    )
  }
}

export const SimpleUploadsList = (): JSX.Element => {
  return (
    <UploadsList>
      {(props) => (
        <div className='w3-uploads-list'>
          <Uploads uploads={props.uploadsList?.[0].data} />
        </div>
      )}
    </UploadsList>
  )
}

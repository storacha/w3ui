import React from 'react'
import { UploadsList } from '@w3ui/react-uploads-list'

export const SimpleUploadsList = (): JSX.Element => {
  return (
    <UploadsList>
      {([{ data }]) => (
        <div className='w3-uploads-list'>
          <nav>
            <UploadsList.NextButton className='next'>
              Next
            </UploadsList.NextButton>
            <UploadsList.ReloadButton className='reload'>
              Reload
            </UploadsList.ReloadButton>
          </nav>
          <table>
            <thead>
              <tr>
                <th>Uploader DID</th>
                <th>CAR CID</th>
                <th>Data CID</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data?.map(({ root }) => (
                <tr key={root.toString()}>
                  <td>{root.toString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </UploadsList>
  )
}

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
              {data?.map(({ dataCID, carCID, uploaderDID, uploadedAt }) => (
                <tr key={dataCID}>
                  <td>{uploaderDID}</td>
                  <td>{carCID}</td>
                  <td>{dataCID}</td>
                  <td>{uploadedAt.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </UploadsList>
  )
}

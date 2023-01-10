import React from 'react'
import { UploadsListRoot, NextButton, ReloadButton } from '@w3ui/react-uploads-list'

export const SimpleUploadsList = (): JSX.Element => {
  return (
    <UploadsListRoot>
      {(props) => (
        <div className='w3-uploads-list'>
          <nav>
            <NextButton className='next'>
              Next
            </NextButton>
            <ReloadButton className='reload'>
              Reload
            </ReloadButton>
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
              {props.uploadsList?.[0].data?.map(({ root }) => (
                <tr key={root.toString()}>
                  <td>{root.toString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </UploadsListRoot>
  )
}

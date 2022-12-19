import React from 'react'
import { CARMetadata } from '@w3ui/uploader-core'
import { Uploader, useUploaderComponent } from '@w3ui/react-uploader'
import { Link, Version } from 'multiformats'

export const Uploading = ({ file, storedDAGShards }: { file?: File, storedDAGShards?: CARMetadata[] }): JSX.Element => (
  <div className='uploading'>
    <h1 className='title'>Uploading DAG for {file?.name}</h1>
    {storedDAGShards?.map(({ cid, size }) => (
      <p className='shard' key={cid.toString()}>
        {cid.toString()} ({size} bytes)
      </p>
    ))}
  </div>
)

export const Errored = ({ error }: { error: any }): JSX.Element => (
  <div className='error'>
    <h1 className='message'>⚠️ Error: failed to upload file: {error.message}</h1>
    <p className='details'>Check the browser console for details.</p>
  </div>
)

interface DoneProps {
  file?: File
  dataCid?: Link<unknown, number, number, Version>
  storedDAGShards?: CARMetadata[]
}

export const Done = ({ file, dataCid, storedDAGShards }: DoneProps): JSX.Element => {
  const cid = dataCid?.toString() ?? ''
  return (
    <div className='done'>
      <h1 className='title'>Done!</h1>
      <p className='cid'>{cid}</p>
      <p className='view'><a href={`https://${cid}.ipfs.w3s.link/`}>View {file?.name} on IPFS Gateway.</a></p>
      <h5 className='chunks'>Shards ({storedDAGShards?.length}):</h5>
      {storedDAGShards?.map(({ cid, size }) => (
        <p className='shard' key={cid.toString()}>
          {cid.toString()} ({size} bytes)
        </p>
      ))}
    </div>
  )
}

export const SimpleUploader = (): JSX.Element => {
  const [{ status, file, error, dataCid, storedDAGShards }] = useUploaderComponent()
  return (
    <Uploader>
      {(status === 'uploading')
        ? (
          <Uploading file={file} storedDAGShards={storedDAGShards} />
          )
        : (
            (status === 'done')
              ? (
                  (error != null) ? <Errored error={error} /> : <Done file={file} dataCid={dataCid} storedDAGShards={storedDAGShards} />
                )
              : (
                <Uploader.Form className=''>
                  <div className='field'>
                    <label htmlFor='w3ui-uploader-file'>File:</label>
                    <Uploader.Input id='w3ui-uploader-file' />
                  </div>
                  <button type='submit'>Upload</button>
                </Uploader.Form>
                )
          )}
    </Uploader>
  )
}

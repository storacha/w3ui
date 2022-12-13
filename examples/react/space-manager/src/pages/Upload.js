import React, { useState } from 'react'
import { useKeyring } from '@w3ui/react-keyring'
import { useUploader } from '@w3ui/react-uploader'
import { useNavigate } from 'react-router-dom'
import { NavbarPage } from '../components/Navbar'
import { Panel } from '../components/Panel'
import { ErrorPage } from './Error'

export function UploadPage () {
  const [{ space }] = useKeyring()
  const [{ storedDAGShards }, uploader] = useUploader()
  const [file, setFile] = useState(null)
  const [dataCID, setDataCID] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState(null)

  if (!uploader) return null

  const handleUploadSubmit = async e => {
    e.preventDefault()
    try {
      setStatus('uploading')
      const cid = await uploader.uploadFile(file)
      setDataCID(cid.toString())
    } catch (err) {
      console.error(err)
      setError(err)
    } finally {
      setStatus('done')
    }
  }

  if (status === 'uploading') {
    return <Uploading space={space} file={file} storedDAGShards={storedDAGShards} />
  }

  if (status === 'done') {
    return error ? <ErrorPage space={space} error={error} /> : <Done space={space} file={file} dataCid={dataCID} storedDAGShards={storedDAGShards} />
  }

  return (
    <NavbarPage space={space}>
      <Panel title='Choose a file:' className='center mv5' style={{ maxWidth: 560 }}>
        <form onSubmit={handleUploadSubmit}>
          <div className='mt4 mb3'>
            <input className='db pa2 w-100 ba br2 white-50' type='file' onChange={e => setFile(e.target.files[0])} required />
          </div>
          <div className='tc'>
            <button type='submit' className='input-reset pointer near-white pv3 ph4 bg-transparent b--transparent hover-bg-white-10 br2'>↑ Upload</button>
          </div>
        </form>
      </Panel>
    </NavbarPage>
  )
}

const Uploading = ({ space, file, storedDAGShards }) => (
  <NavbarPage space={space}>
    <Panel title={`Uploading DAG for ${file.name}`} className='center mv5' style={{ maxWidth: 560 }}>
      <p className='near-white'>Chunks ({storedDAGShards.length}):</p>
      {storedDAGShards.map(({ cid, size }) => (
        <p key={cid.toString()} className='f7 truncate'>
          {cid.toString()} ({size} bytes)
        </p>
      ))}
    </Panel>
  </NavbarPage>
)

const Done = ({ space, file, dataCid, storedDAGShards }) => {
  const navigate = useNavigate()
  return (
    <NavbarPage space={space}>
      <Panel title='Done!' className='center mv5' style={{ maxWidth: 560 }}>
        <p className='f6 code truncate'>{dataCid.toString()}</p>
        <p><a href={`https://w3s.link/ipfs/${dataCid}`} className='blue'>View {file.name} on IPFS Gateway.</a></p>
        <p className='near-white'>Chunks ({storedDAGShards.length}):</p>
        {storedDAGShards.map(({ cid, size }) => (
          <p key={cid.toString()} className='f7 truncate'>
            {cid.toString()} ({size} bytes)
          </p>
        ))}
        <form onSubmit={e => { e.preventDefault(); navigate(`/space/${space.did()}`) }} className='tc mt3'>
          <button type='submit' className='input-reset pointer near-white pv3 ph4 bg-transparent b--transparent hover-bg-white-10 br2'>Finish</button>
        </form>
      </Panel>
    </NavbarPage>
  )
}

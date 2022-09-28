/* global Blob, File */

import React, { useState, useRef } from 'react'
import { useUploader } from '@w3ui/react-uploader'
import { withIdentity } from './components/Authenticator'
import { Camera } from 'react-camera-pro'

import './spinner.css'

function dataURLtoFile (dataurl) {
  const arr = dataurl.split(','); const mime = arr[0].match(/:(.*?);/)[1]
  const bstr = atob(arr[1]); let n = bstr.length; const u8arr = new Uint8Array(n)
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }
  const blob = new Blob([u8arr], { type: mime })
  return new File([blob], 'camera-image')
}

export function ContentPage () {
  const { uploader } = useUploader()
  const [file, setFile] = useState(null)
  const [rootCid, setRootCid] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState(null)
  const camera = useRef(null)
  const [image, setImage] = useState(null)

  if (!uploader) return null

  // refactor to be pure func with return values?
  const takePhoto = async e => {
    e.preventDefault()
    const imgdata = camera.current.takePhoto()
    setImage(imgdata)

    try {
      // Build a DAG from the file data to obtain the root CID.
      setStatus('encoding')
      const theFile = dataURLtoFile(imgdata)
      setFile(theFile)
      const { cid, car } = await uploader.encodeFile(theFile)
      setRootCid(cid.toString())

      // Upload the DAG to the service.
      setStatus('uploading')
      await uploader.uploadCar(car)
    } catch (err) {
      console.error(err)
      setError(err)
    } finally {
      setStatus('done')
    }
  }

  // convert this to status printout?
  if (status === 'encoding') {
    return <Encoding file={file} />
  }

  if (status === 'uploading') {
    return <Uploading file={file} cid={rootCid} />
  }

  if (status === 'done') {
    return error ? <Errored error={error} /> : <Done file={file} cid={rootCid} image={image} />
  }

  return (
    <div>
      <button onClick={takePhoto}>Take photo</button>
      <Camera ref={camera} />
    </div>
  )
}

const Encoding = ({ file }) => (
  <div className='flex items-center'>
    <div className='spinner mr3 flex-none' />
    <div className='flex-auto'>
      <p className='truncate'>Building DAG for {file.name}</p>
    </div>
  </div>
)

const Uploading = ({ file, cid }) => (
  <div className='flex items-center'>
    <div className='spinner mr3 flex-none' />
    <div className='flex-auto'>
      <p className='truncate'>Uploading DAG for {file.name}</p>
      <p className='f6 code truncate'>{cid}</p>
    </div>
  </div>
)

const Errored = ({ error }) => (
  <div>
    <h1 className='near-white'>⚠️ Error: failed to upload file: {error.message}</h1>
    <p>Check the browser console for details.</p>
  </div>
)

const Done = ({ file, cid }) => (
  <div>
    <h1 className='near-white'>Done!</h1>
    <p className='f6 code truncate'>{cid}</p>
    <p><a href={`https://w3s.link/ipfs/${cid}`} className='blue'>View {file.name} on IPFS Gateway.</a></p>
  </div>
)

export default withIdentity(ContentPage)

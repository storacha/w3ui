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
  const [status, setStatus] = useState('')
  const [error, setError] = useState(null)
  const camera = useRef(null)
  const [images, setImages] = useState([])

  if (!uploader) return null

  // refactor to be pure func with return values?
  const takePhoto = async e => {
    e.preventDefault()
    const imgdata = camera.current.takePhoto()

    try {
      // Build a DAG from the file data to obtain the root CID.
      setStatus('encoding')
      const theFile = dataURLtoFile(imgdata)
      const { cid, car } = await uploader.encodeFile(theFile)

      setImages([{ cid: cid, data: imgdata }, ...images])

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

  const printStatus = (status === 'done' && error) ? error : status

  return (
    <div>
      <p><button onClick={takePhoto}>Take photo</button> {printStatus}</p>
      <Camera ref={camera} />

      {images.map(({ cid, data }) => {
        return (
          <li key={cid}>
            <a href={`https://w3s.link/ipfs/${cid}`}>
              <img alt='camera output' src={data} />
            </a>
          </li>
        )
      })}
    </div>
  )
}

export default withIdentity(ContentPage)

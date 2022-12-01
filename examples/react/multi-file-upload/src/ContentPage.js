import React, { useState } from 'react'
import { useUploader } from '@w3ui/react-uploader'
import { withIdentity } from './components/Authenticator'
import './spinner.css'

export function ContentPage() {
  const [{ uploadedCarChunks }, uploader] = useUploader()
  const [files, setFiles] = useState([])
  const [allowDirectory, setAllowDirectory] = useState(false)
  const [wrapInDirectory, setWrapInDirectory] = useState(false)
  const [dataCid, setDataCid] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState(null)

  if (!uploader) return null

  const handleUploadSubmit = async e => {
    e.preventDefault()
    try {
      setStatus('uploading')
      const cid = files.length > 1
        ? await uploader.uploadDirectory(files)
        : wrapInDirectory
          ? await uploader.uploadDirectory(files)
          : await uploader.uploadFile(files[0])
      setDataCid(cid.toString())
    } catch (err) {
      console.error(err)
      setError(err)
    } finally {
      setStatus('done')
    }
  }

  const resetUploader = async e => {
    e.preventDefault()
    setStatus('')
    setFiles([])
  }

  const uploading = status === 'uploading' ? <Uploading files={files} uploadedCarChunks={uploadedCarChunks} /> : '';

  return (
    <div className="w3ui-uploader-wrapper">
      <form onSubmit={handleUploadSubmit}>
        <div className='w3ui-uploader mb3'>
          <label htmlFor='files' className='w3ui-uploader__label db mb2'>Files:</label>
          {allowDirectory
            ? <input id='file' className='w3ui-uploader__input db pa2 w-100 ba br2' type='file' webkitdirectory='true' onChange={e => setFiles(Array.from(e.target.files))} required />
            : <input id='file' className='w3ui-uploader__input db pa2 w-100 ba br2' type='file' multiple onChange={e => setFiles(Array.from(e.target.files))} required />}
        </div>
        <div className='mb3'>
          <label>
            <input type='checkbox' value={allowDirectory} onChange={e => setAllowDirectory(e.target.checked)} /> Allow directory selection
          </label>
        </div>
        {files.length === 1
          ? (
            <div className='mb3'>
              <label>
                <input type='checkbox' value={wrapInDirectory} onChange={e => setWrapInDirectory(e.target.checked)} /> Wrap file in a directory
              </label>
            </div>
          )
          : null}

        {status === 'done' && (
          error ? <Errored error={error} /> : <Done files={files} dataCid={dataCid} uploadedCarChunks={uploadedCarChunks} resetUploader={resetUploader} />
        )}

        {files.length > 0 && (status === '' || status === 'uploading') && (
          <>
            <p>Files:</p>
            <div class="w3ui-uploader-list">
              {files.map((file, idx) => {
                return (
                  <div key={file.name} className="w3ui-uploader-list__item">
                    <span className='truncate'>{file.name}</span>
                    <span>{file.type}</span>
                    {/* <span>{file.size}</span> */}
                  </div>
                )
              })}
              {uploading}
            </div>
          </>
        )}

        <button type='submit' disabled="" className='w3ui-button ph3 pv2'>Upload</button>
      </form>
    </div>
  )
}

const Uploading = ({ files, dataCid, uploadedCarChunks }) => (
  <div className='w3ui-uploader-uploading flex items-center'>
    <div className='spinner mr3 flex-none' />
    <div className='flex-auto'>
      <p className='truncate'>Uploading DAG for {files.length > 1 ? `${files.length} files` : files[0].name}</p>
      {uploadedCarChunks.map(({ cid, size }) => (
        <p key={cid.toString()} className='f7 truncate'>
          {cid.toString()} ({size} bytes)
        </p>
      ))}
    </div>
  </div>
)

const Errored = ({ error }) => (
  <div>
    <h1 className='near-white'>⚠️ Error: failed to upload file(s): {error.message}</h1>
    <p>Check the browser console for details.</p>
  </div>
)

const Done = ({ files, dataCid, uploadedCarChunks, resetUploader }) => (
  <div class="w3ui-uploader-complete">
    <h3 className='near-white mt0'>Done!</h3>
    <p className='f6 code truncate'>{dataCid.toString()}</p>
    <p><a href={`https://w3s.link/ipfs/${dataCid}`} className='w3ui-link'>View {files.length > 1 ? 'files' : files[0].name} on IPFS Gateway.</a></p>
    <p className='near-white'>Chunks ({uploadedCarChunks.length}):</p>
    {uploadedCarChunks.map(({ cid, size }) => (
      <p key={cid.toString()} className='f7 truncate'>
        {cid.toString()} ({size} bytes)
      </p>
    ))}
    <button class="w3ui-uploader-complete__close" onClick={resetUploader}>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 14" height={20} width={20} ><g><g><line x1={9.12} y1={4.88} x2={4.88} y2={9.12} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" /><line x1={4.88} y1={4.88} x2={9.12} y2={9.12} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" /></g><circle cx={7} cy={7} r={6.5} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" /></g></svg>
    </button>
  </div>
)

export default withIdentity(ContentPage)

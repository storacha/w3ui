import { useContext } from 'react'
import { useUploader, UploaderProvider } from '@w3ui/react-uploader'

const UploaderContext = useContext({})

export const Uploader = ({
  children,
  Uploading = DefaultUploading,
  Errored = DefaultErrored,
  Done = DefaultDone,
  ...props
}) => {
  const [{ storedDAGShards }, uploader] = useUploader()
  const [file, setFile] = useState(null)
  const [dataCid, setDataCid] = useState('')
  const [status, setStatus] = useState('')
  const [error, setError] = useState(null)

  const handleUploadSubmit = async e => {
    e.preventDefault()
    try {
      setStatus('uploading')
      const cid = await uploader.uploadFile(file)
      setDataCid(cid)
    } catch (err) {
      console.error(err)
      setError(err)
    } finally {
      setStatus('done')
    }
  }
  return (
    <UploaderContext.Provider value={{ storedDAGShards, file, setFile, dataCid, status, error }}>
      {(status === 'uploading') ? (
        <Uploading file={file} storedDAGShards={storedDAGShards} />
      ) : (
        (status === 'done') ? (
          error ? <Errored error={error} /> : <Done file={file} dataCid={dataCid} storedDAGShards={storedDAGShards} />
        ) : (
          <form onSubmit={handleUploadSubmit} {...props}>
            <div className=''>
              <label htmlFor='w3ui-uploader-file-input'>File:</label>
              <input id='w3ui-uploader-file-input' type='file' onChange={e => setFile(e.target.files[0])} required />
            </div>
            <button type='submit'>Upload</button>
          </form>

        )
      )}
    </UploaderContext.Provider>
  )
}

const DefaultUploading = ({ file, storedDAGShards }) => (
  <div>
    <p>Uploading DAG for {file.name}</p>
    {storedDAGShards.map(({ cid, size }) => (
      <p key={cid.toString()}>
        {cid.toString()} ({size} bytes)
      </p>
    ))}
  </div>
)

const DefaultErrored = ({ error }) => (
  <div>
    <h1>⚠️ Error: failed to upload file: {error.message}</h1>
    <p>Check the browser console for details.</p>
  </div>
)

const DefaultDone = ({ file, dataCid, storedDAGShards }) => (
  <div>
    <h1>Done!</h1>
    <p>{dataCid.toString()}</p>
    <p><a href={`https://w3s.link/ipfs/${dataCid}`}>View {file.name} on IPFS Gateway.</a></p>
    <p>Chunks ({storedDAGShards.length}):</p>
    {storedDAGShards.map(({ cid, size }) => (
      <p key={cid.toString()}>
        {cid.toString()} ({size} bytes)
      </p>
    ))}
  </div>
)

Uploader.Input = (props) => {
  const { setFile } = useContext(UploaderContext)
  return (
    <input type='file' onChange={e => setFile(e.target.files[0])} {...props} />
  )
}

Uploader.Form = ({ children, ...props }) => {
  const { handleUploadSubmit } = useContext(UploaderContext)
  return (
    <form onSubmit={handleUploadSubmit} {...props}>
      {children}
    </form>
  )
}

export const SimpleUploader = () => {
  return (
    <Uploader>
      <Uploader.Form>
        <div>
          <label htmlFor='w3ui-uploader-file'>File:</label>
          <Uploader.Input id="w3ui-uploader-file" />
        </div>
        <button type='submit'>Upload</button>
      </Uploader.Form>
    </Uploader>
  )
}

export default Uploader
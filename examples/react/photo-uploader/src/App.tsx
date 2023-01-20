import { Authenticator, Uploader, UploadsList, W3APIProvider } from '@w3ui/react'
import { useUploadsList } from '@w3ui/react-uploads-list'
import './App.css'

function PhotosList () {
  const [{ data }] = useUploadsList()
  return (
    <div>
      {data?.map(upload => (
        <img key={upload.root.toString()}
          width="100"
          src={`https://${upload.root.toString()}.ipfs.w3s.link/`} />
      ))}
    </div>
  )
}

function App () {
  return (
    <div className="App">
      <W3APIProvider>
        <Authenticator>
          <Uploader />
          <PhotosList />
        </Authenticator>
      </W3APIProvider>
    </div>
  )
}

export default App

import { SimpleAuthenticator, SimpleUploader, SimpleUploadsList, W3APIProvider } from '@w3ui/react-ui'
import '@w3ui/react-ui/src/styles/uploader.css'

export function App (): JSX.Element {
  return (
    <main className='bg-slate-700'>
      <W3APIProvider>
        <SimpleAuthenticator>
          <SimpleUploader />
          <SimpleUploadsList />
        </SimpleAuthenticator>
      </W3APIProvider>
    </main>
  )
}

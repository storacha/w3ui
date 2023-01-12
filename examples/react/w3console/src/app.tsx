import './app.css'

import { SimpleAuthenticator, SimpleUploader, SimpleUploadsList, W3APIProvider } from '@w3ui/react-ui'

export function App (): JSX.Element {
  return (
    <W3APIProvider>
      <SimpleAuthenticator>
        <SimpleUploader />
        <SimpleUploadsList />
      </SimpleAuthenticator>
    </W3APIProvider>
  )
}

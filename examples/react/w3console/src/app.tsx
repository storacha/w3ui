import { SimpleAuthenticator, SimpleUploader, SimpleUploadsList, W3APIProvider } from '@w3ui/react-ui'
import { useKeyring } from '@w3ui/react-keyring'
import { useUploadsList } from '@w3ui/react-uploads-list'
import md5 from 'blueimp-md5'
import '@w3ui/react-ui/src/styles/uploader.css'

function Space (): JSX.Element {
  const [{ space }] = useKeyring()
  const [, { reload }] = useUploadsList()
  return (
    <div className='flex flex-col'>
      <div className='flex flex-row space-x-4 mb-4 justify-between'>
        <div className='shrink-0'>
          {(space !== undefined) && (
            <img src={`https://www.gravatar.com/avatar/${md5(space.did())}?d=identicon`} className='w-32' />
          )}
        </div>
        <SimpleUploader onUploadComplete={() => { void reload() }} />
      </div>
      <SimpleUploadsList />
    </div>
  )
}

export function App (): JSX.Element {
  return (
    <main className='bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-4 min-h-screen'>
      <W3APIProvider>
        <SimpleAuthenticator>
          <div className='flex flex-row space-x-4'>
            <div className='flex flex-col w-1/3 bg-gray-200 dark:bg-gray-800 p-4 rounded-md'>
              <div className='h-24'>
                account global stats, etc
                link to payment
              </div>
              <div>
                my spaces list
                <ul>
                  <li>space 1</li>
                  <li className='font-bold'>space 2</li>
                </ul>
              </div>
            </div>
            <div className='w-2/3 bg-gray-200 dark:bg-gray-800 p-4 rounded-md'>
              <Space />
            </div>
          </div>
        </SimpleAuthenticator>
      </W3APIProvider>
    </main>
  )
}

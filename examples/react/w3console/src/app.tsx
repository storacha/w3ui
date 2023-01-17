import { Authenticator, Uploader, UploadsList, W3APIProvider } from '@w3ui/react'
import { useKeyring } from '@w3ui/react-keyring'
import { useUploadsList } from '@w3ui/react-uploads-list'
import md5 from 'blueimp-md5'
import '@w3ui/react/src/styles/uploader.css'

function Space (): JSX.Element {
  const [{ space }] = useKeyring()
  const [, { reload }] = useUploadsList()
  return (
    <div className='container mx-auto'>
      <div className='flex flex-row space-x-4 mb-4 justify-between'>
        <div className='shrink-0'>
          {(space !== undefined) && (
            <img src={`https://www.gravatar.com/avatar/${md5(space.did())}?d=identicon`} className='w-20' />
          )}
        </div>
        <Uploader onUploadComplete={() => { void reload() }} />
      </div>
      <UploadsList />
    </div>
  )
}

export function App (): JSX.Element {
  return (
    <W3APIProvider>
      <Authenticator>
        <div className='flex min-h-full w-full'>
          <nav className='flex-none w-72 bg-white p-4 border-r border-gray-200'>
            <div className='flex flex-col justify-between min-h-full'>
              <div className='grow'>
                <h1 className='font-bold pb-4'>w3console</h1>
              </div>
              <div className='flex-none'>
                Space selector
                <ul>
                  <li>space 1</li>
                  <li className='font-bold'>space 2</li>
                </ul>
              </div>
            </div>
          </nav>
          <main className='grow bg-gray-100 dark:bg-gray-800 p-4'>
            <Space />
          </main>
        </div>
      </Authenticator>
    </W3APIProvider>
  )
}

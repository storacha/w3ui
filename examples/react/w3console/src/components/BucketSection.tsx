import { useKeyring } from '@w3ui/react-keyring'
import { ShareIcon } from '@heroicons/react/20/solid'
import md5 from 'blueimp-md5'
import { SpaceShare } from '../share'
import { BucketList } from './BucketList'
import { SpaceRegistrar } from './SpaceRegistrar'

interface BucketSectionProps {
  viewSpace: (did: string) => void
  setShare: (share: boolean) => void
  share: boolean
}
export function BucketSection (props: BucketSectionProps): JSX.Element {
  const { viewSpace, share, setShare } = props
  const [{ space }] = useKeyring()
  const registered = Boolean(space?.registered())
  return (
    <div>
      <header className='py-3'>
        {space !== undefined && (
          <div className='flex flex-row items-start gap-2'>
            <img
              title={space.did()}
              src={`https://www.gravatar.com/avatar/${md5(
                space.did()
              )}?d=identicon`}
              className='w-10 hover:saturate-200 saturate-0 invert border-solid border-gray-500 border' />
            <div className='grow overflow-hidden whitespace-nowrap text-ellipsis text-gray-500'>
              <h1 className='text-xl font-semibold leading-5 text-white'>
                {space.name() ?? 'Untitled'}
              </h1>
              <label className='font-mono text-xs'>
                {space.did()}
              </label>
            </div>
            <button
              className='h-6 w-6 text-gray-500 hover:text-gray-100'
              onClick={() => setShare(!share)}
            >
              <ShareIcon />
            </button>
          </div>
        )}
      </header>
      <div className='container mx-auto'>
        {share && <SpaceShare viewSpace={viewSpace} />}
        {registered && !share && (
          <>
            <div className='mt-8'>
              <BucketList />
            </div>
          </>
        )}
        {(space && !registered) && !share && <SpaceRegistrar />}
        {!space && (
          <div className="text-center">
            <h1 className="text-xl">Select a space from the dropdown on the left to get started.</h1>
          </div>
        )}
      </div>
    </div>
  )
}

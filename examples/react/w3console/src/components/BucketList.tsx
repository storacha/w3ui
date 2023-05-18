import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, ArrowPathIcon } from '@heroicons/react/20/solid'
import { CloudArrowUpIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline'
import { gatewayHost } from '../components/services'
import { ShardValueEntry } from '@alanshaw/pail/src/shard'

interface BucketListProps {
  entries: ShardValueEntry[]
  loading?: boolean
  onPrefixChange: (pfx: string) => void
}

export function BucketList ({ entries, loading, onPrefixChange }: BucketListProps): JSX.Element {
  const [prefix, setPrefix] = useState('')

  if (!entries.length) {
    return (
      <>
        <div className='text-zinc-300 text-center mb-4'>No objects</div>
        <nav className='flex flex-row justify-center'>
          <button className='w3ui-button'>
            <ArrowPathIcon className={`h-6 w-6  ${loading ? 'animate-spin' : ''}`}/>
          </button>
        </nav>
      </>
    )
  }

  return (
    <>
      <div className='flex justify-between mb-4'>
        <form onSubmit={e => { e.preventDefault(); onPrefixChange(prefix) }}>
          <label for='prefix-search' className='sr-only'>Search</label>
          <div className='relative inline-block mr-3'>
            <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
              <svg aria-hidden='true' className='w-5 h-5 text-gray-500 dark:text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'></path></svg>
            </div>
            <input type='search' id='prefix-search' className='block w-full px-3 py-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500' placeholder='Search objects by prefix...' onChange={e => setPrefix(e.target.value)} required />
          </div>
          <button type='submit' className='focus:ring-4 focus:outline-none focus:ring-blue-300 w3ui-button' disabled={loading}>Search</button>
        </form>
        <div>
          <button className='focus:ring-4 focus:outline-none focus:ring-blue-300 text-white bg-blue-800 hover:bg-blue-600 rounded-md py-2 px-8 text-sm font-medium transition-colors ease-in'>
            <CloudArrowUpIcon className='h-5 w-5 inline-block align-middle mr-1' />
            <span className='align-middle'>Upload</span>
          </button>
        </div>
      </div>
      <div className='rounded-md border border-zinc-300'>
        <table className='border-collapse table-auto w-full divide-y divide-zinc-300'>
          <thead className='text-left text-sm text-zinc-300'>
            <tr>
              <th className='p-3 w-10 text-center'>
                <input type='checkbox' />
              </th>
              <th className='p-3'>Object</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([key, value]) => (
              <tr key={key} className='bg-gray-dark hover:bg-slate-800'>
                <td className='p-2 pl-3 w-10 text-center'>
                  <input type='checkbox' />
                </td>
                <td className='p-2 pl-3 text-sm overflow-hidden no-wrap text-ellipsis'>
                  <a href={`https://${value.toString()}.ipfs.${gatewayHost}/`}>
                    {key}
                  </a>
                </td>
                <td className='p-2 pl-3 w-20 text-center'>
                  <button className='px-2 py-1'>
                    <EllipsisHorizontalIcon className='h-6 w-6' />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <nav className='flex flex-row justify-center space-x-4 my-4'>
        <button className='w3ui-button'>
          <ChevronLeftIcon className='h-6 w-6'/>
        </button>
        <button className='w3ui-button'>
          <ChevronRightIcon className='h-6 w-6'/>
        </button>
      </nav>
    </>
  )
}

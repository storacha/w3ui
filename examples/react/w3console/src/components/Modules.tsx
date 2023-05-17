import { NavLink } from 'react-router-dom'
import { UploadsIcon, Web3BucketLogo } from '../brand'

export default function Modules () {
  return (
    <>
      <h3 className='text-xs tracking-wider uppercase font-bold my-2 text-gray-400 font-mono'>
        Modules
      </h3>
      <ModuleLink to='/'>
        <UploadsIcon className='w-5 mr-2 inline' /> Uploads
      </ModuleLink>
      <ModuleLink to='/bucket'>
        <Web3BucketLogo className='w-5 mr-2 inline' /> Bucket
      </ModuleLink>
    </>
  )
}

function ModuleLink ({ to, children }: { to: string, children: string | JSX.Element | JSX.Element[] }) {
  return (
    <NavLink to={to} className={moduleLinkClass}>
      {children}
    </NavLink>
  )
}

function moduleLinkClass ({ isActive }: { isActive: boolean }) {
  return `text-sm px-4 py-3 mb-3 block align-middle rounded-lg transition-all border ${isActive ? 'border-white bg-white/5' : 'border-transparent bg-white/0 hover:bg-white/5'}`
}
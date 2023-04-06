import { Logo } from '../brand'
import { Fragment, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'

interface LayoutComponentProps {
  sidebar?: JSX.Element | JSX.Element[]
  children: JSX.Element | JSX.Element[]
}
type LayoutComponent = (props: LayoutComponentProps) => JSX.Element

const navLinks = [
  { name: 'Terms', href: '/terms' },
  { name: 'Docs', href: '/docs' },
  { name: 'Support', href: 'https://github.com/web3-storage/w3ui/issues' },
]

export const DefaultLayout: LayoutComponent = ({ sidebar = <div></div>, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <div>
        {/* Hamburger menu sidebar for smol screens */}
        <Transition.Root show={sidebarOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
            <Transition.Child
              as={Fragment}
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </Transition.Child>

            <div className="fixed inset-0 flex">
              <Transition.Child
                as={Fragment}
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="relative flex w-full max-w-xs flex-1">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute right-0 top-0 flex w-16 justify-center pt-5">
                      <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>
                  <nav className='flex-none w-64 bg-gray-900 text-white px-4 pb-4 border-r border-gray-800 h-screen'>
                    <div className='flex flex-col justify-between h-full'>
                      {sidebar}
                      <div className='flex flex-col items-center'>
                        <a href='/'><Logo className='w-36 mb-2' /></a>
                        <div className='flex flex-row space-x-2'>
                          {navLinks.map(link => (
                            <a className='text-xs block text-center mt-2' href={link.href}>{link.name}</a>
                          ))}
                        </div>
                      </div>
                    </div>
                  </nav>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition.Root>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          <nav className='flex-none w-64 bg-gray-900 text-white px-4 pb-4 border-r border-gray-800 h-screen'>
            <div className='flex flex-col justify-between h-full'>
              {sidebar}
              <div className='flex flex-col items-center'>
                <a href='/'><Logo className='w-36 mb-2' /></a>
                <div className='flex flex-row space-x-2'>
                  {navLinks.map(link => (
                    <a className='text-xs block text-center mt-2' href={link.href}>{link.name}</a>
                  ))}
                </div>
              </div>
            </div>
          </nav>
        </div>

        <div className="lg:pl-72 text-white">
          <div className="sticky top-0 z-40 flex justify-between h-16 shrink-0 items-center gap-x-4 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden">
            <button type="button" className="-m-2.5 p-2.5 text-gray-700 lg:hidden" onClick={() => setSidebarOpen(true)}>
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon className="text-white h-6 w-6" aria-hidden="true" />
            </button>
            <a href='/'><Logo className='w-36 mb-2' /></a>
          </div>
          <main className="grow bg-gray-dark p-4 h-screen overflow-scroll">
            {children}
          </main>
        </div>
      </div>
    </>
  )
}
import React, { useContext, useMemo, createContext, useState } from 'react'
import { Link, Version } from 'multiformats'
import { CARMetadata, UploaderContextState, UploaderContextActions } from '@w3ui/uploader-core'
import { useUploader } from './providers/Uploader'

export type UploaderComponentContextState = UploaderContextState & {
  status?: string,
  error?: any,
  file?: File,
  handleUploadSubmit?: (e: Event) => void
  dataCid?: Link<unknown, number, number, Version>,
  storedDAGShards?: CARMetadata[],
}

export type UploaderComponentContextActions = UploaderContextActions & {
  setFile: React.Dispatch<React.SetStateAction<File | undefined>>
}

export type UploaderComponentContextValue = [
  state: UploaderComponentContextState,
  actions: UploaderComponentContextActions
]

const UploaderComponentContext = createContext<UploaderComponentContextValue>([
  { storedDAGShards: [] },
  {
    setFile: () => { throw new Error('missing set file function') },
    uploadFile: async () => { throw new Error('missing uploader context provider') },
    uploadDirectory: async () => { throw new Error('missing uploader context provider') }
  }
])

export type HeadlessUploaderProps = {
  children?: JSX.Element,
}

export const Uploader = ({
  children,
}: HeadlessUploaderProps) => {
  const [uploaderState, uploaderActions] = useUploader()
  const [file, setFile] = useState<File>()
  const [dataCid, setDataCid] = useState<Link<unknown, number, number, Version>>()
  const [status, setStatus] = useState('')
  const [error, setError] = useState()

  const handleUploadSubmit = async (e: Event) => {
    e.preventDefault()
    if (file) {
      try {
        setStatus('uploading')
        const cid = await uploaderActions.uploadFile(file)
        setDataCid(cid)
      } catch (err: any) {
        setError(err)
      } finally {
        setStatus('done')
      }
    }
  }

  const uploaderComponentContextValue = useMemo<UploaderComponentContextValue>(() => [
    { ...uploaderState, file, dataCid, status, error, handleUploadSubmit },
    { ...uploaderActions, setFile }
  ], [uploaderState, file, dataCid, status, error, handleUploadSubmit, uploaderActions, setFile])

  return (
    <UploaderComponentContext.Provider value={uploaderComponentContextValue}>
      {children}
    </UploaderComponentContext.Provider>
  )
}

Uploader.Input = (props: any) => {
  const [, { setFile }] = useContext(UploaderComponentContext)
  return (
    <input type='file' onChange={e => setFile(e?.target?.files?.[0])} {...props} />
  )
}

Uploader.Form = ({ children, ...props }: { children: React.ReactNode } & any) => {
  const [{ handleUploadSubmit }] = useContext(UploaderComponentContext)
  return (
    <form onSubmit={handleUploadSubmit} {...props}>
      {children}
    </form>
  )
}

/**
 * Use the scoped uploader context state from a parent `Uploader`.
 */
export function useUploaderComponent(): UploaderComponentContextValue {
  return useContext(UploaderComponentContext)
}

export default Uploader
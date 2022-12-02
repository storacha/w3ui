import React, { useContext, createContext, useState } from 'react'
import { useUploader, CARMetadata } from '@w3ui/react-uploader'
import { Link, Version } from 'multiformats'

export type UploaderContextValue = {
  storedDAGShards?: CARMetadata[],
  file?: File,
  setFile: React.Dispatch<React.SetStateAction<File | undefined>>,
  dataCid?: Link<unknown, number, number, Version>,
  status?: string,
  error?: any,
  handleUploadSubmit?: (e: Event) => void

}

export const UploaderContext = createContext<UploaderContextValue>({
  setFile: () => {}
})

export type UploaderProps = {
  children: React.ReactNode,
}

export const Uploader = ({
  children,
}: UploaderProps) => {
  const [{ storedDAGShards }, uploader] = useUploader()
  const [file, setFile] = useState<File>()
  const [dataCid, setDataCid] = useState<Link<unknown, number, number, Version>>()
  const [status, setStatus] = useState('')
  const [error, setError] = useState()

  const handleUploadSubmit = async (e: Event) => {
    e.preventDefault()
    if (file) {
      try {
        setStatus('uploading')
        const cid = await uploader.uploadFile(file)
        setDataCid(cid)
      } catch (err: any) {
        console.error(err)
        setError(err)
      } finally {
        setStatus('done')
      }
    }
  }
  return (
    <UploaderContext.Provider value={{ storedDAGShards, file, setFile, dataCid, status, error, handleUploadSubmit }}>
      {children}
    </UploaderContext.Provider>
  )
}

Uploader.Input = (props: any) => {
  const { setFile } = useContext(UploaderContext)
  return (
    <input type='file' onChange={e => setFile(e?.target?.files?.[0])} {...props} />
  )
}

Uploader.Form = ({ children, ...props }: {children: React.ReactNode} & any) => {
  const { handleUploadSubmit } = useContext(UploaderContext)
  return (
    <form onSubmit={handleUploadSubmit} {...props}>
      {children}
    </form>
  )
}

export default Uploader
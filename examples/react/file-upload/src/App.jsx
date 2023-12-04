import { Authenticator, useAuthenticator, Provider, Uploader, useUploader, UploadStatus, useW3 } from '@w3ui/react'
import { ArrowPathIcon } from '@heroicons/react/20/solid'
import { useEffect } from 'react'

export function Loader() {
  return <ArrowPathIcon className="animate-spin h-12 w-12 mx-auto mt-12" />
}

function AuthenticationForm() {
  const [{ submitted }] = useAuthenticator()
  return (
    <div>
      <Authenticator.Form>
        <div>
          <label htmlFor='authenticator-email'>Email</label>
          <Authenticator.EmailInput id='authenticator-email' required />
        </div>
        <div>
          <button type='submit' disabled={submitted}>
            Authorize
          </button>
        </div>
      </Authenticator.Form>
    </div >
  )
}

function AuthenticationSubmitted() {
  const [{ email }] = useAuthenticator()
  return (
    <div className='authenticator'>
      <div className='text-zinc-950 bg-grad rounded-xl shadow-md px-10 pt-8 pb-8'>
        <h1 className='text-xl font-semibold'>Verify your email address!</h1>
        <p className='pt-2 pb-4'>
          Click the link in the email we sent to <span className='font-semibold tracking-wide'>{email}</span> to authorize this agent.
        </p>
        <Authenticator.CancelButton className='inline-block bg-zinc-950 hover:outline text-white font-bold text-sm px-6 py-2 rounded-full whitespace-nowrap' >
          Cancel
        </Authenticator.CancelButton>
      </div>
    </div>
  )
}

function AuthenticationEnsurer({ children }) {
  const [{ submitted, accounts, client }] = useAuthenticator()
  const authenticated = !!accounts.length
  if (authenticated) {
    return <>{children}</>
  }
  if (submitted) {
    return <AuthenticationSubmitted />
  }
  if (client) {
    return <AuthenticationForm />
  }
  return <Loader />
}

function humanFileSize(bytes) {
  const size = (bytes / (1024 * 1024)).toFixed(2)
  return `${size} MiB`
}

function Uploading({ file, storedDAGShards, uploadProgress }) {
  return (
    <div className='flex flex-col items-center w-full'>
      <h1 className='font-bold text-sm uppercase text-zinc-950'>Uploading {file?.name}</h1>
      <Loader uploadProgress={uploadProgress} />
      {storedDAGShards?.map(({ cid, size }) => (
        <p className='text-xs max-w-full overflow-hidden text-ellipsis' key={cid.toString()}>
          shard {cid.toString()} ({humanFileSize(size)}) uploaded
        </p>
      ))}
    </div>
  )
}

function Errored({ error }) {
  return (
    <div className='flex flex-col items-center'>
      <h1>
        ⚠️ Error: failed to upload file: {error.message}
      </h1>
      <p>Check the browser console for details.</p>
    </div>
  )
}

function Done({ dataCID }) {
  const [, { setFile }] = useUploader()
  const cid = dataCID?.toString() ?? ''
  return (
    <div className='flex flex-col items-center w-full'>
      <h1 className='font-bold text-sm uppercase text-zinc-950 mb-1 '>Uploaded</h1>
      <a
        className='font-mono text-xs max-w-full overflow-hidden no-wrap text-ellipsis'
        href={`https://${cid}.ipfs.w3s.link/`}
      >
        {cid}
      </a>
      <div className='p-4'>
        <button
          className='w3ui-button'
          onClick={() => {
            setFile(undefined)
          }}
        >
          Add More
        </button>
      </div>
    </div>
  )
}

function UploaderConsole() {
  const [{ status, file, error, dataCID, storedDAGShards, uploadProgress }] =
    useUploader()

  switch (status) {
    case UploadStatus.Uploading: {
      return <Uploading file={file} storedDAGShards={storedDAGShards} uploadProgress={uploadProgress} />
    }
    case UploadStatus.Succeeded: {
      return (
        <Done file={file} dataCID={dataCID} storedDAGShards={storedDAGShards} />
      )
    }
    case UploadStatus.Failed: {
      return <Errored error={error} />
    }
    default: {
      return <></>
    }
  }
}

function UploaderContents() {
  const [{ status, file }] = useUploader()
  const hasFile = file !== undefined
  if (status === UploadStatus.Idle) {
    return hasFile
      ? (
        <>
          <div className='flex flex-row'>
            <div className='flex flex-col justify-around'>
              <span className='text-sm'>{file.name}</span>
              <span className='text-xs text-white/75 font-mono'>
                {humanFileSize(file.size)}
              </span>
            </div>
          </div>
          <div className='p-4'>
            <button
              type='submit'
              className='w3ui-button'
              disabled={file === undefined}
            >
              Upload
            </button>
          </div>
        </>
      )
      : <></>
  } else {
    return (
      <>
        <UploaderConsole />
      </>
    )
  }
}

function UploaderForm() {
  const [{ file }] = useUploader()
  const hasFile = file !== undefined
  return (
    <Uploader.Form>
      <div className={`relative shadow h-52 p-8 rounded-md bg-white/5 hover:bg-white/20 border-2 border-dotted border-zinc-950 flex flex-col justify-center items-center text-center`}>
        <label className={`${hasFile ? 'hidden' : 'block h-px w-px overflow-hidden absolute whitespace-nowrap'}`}>File:</label>
        <Uploader.Input className={`${hasFile ? 'hidden' : 'block absolute inset-0 cursor-pointer w-full opacity-0'}`} />
        <UploaderContents />
        {hasFile ? '' : <span>Drag files or Click to Browse</span>}
      </div>
    </Uploader.Form>
  )
}

function SpaceEnsurer({ children }) {
  const [{ client }] = useW3()
  useEffect(function () {
    async function ensureCurrentSpace() {
      if (client && !client.currentSpace()) {
        client.setCurrentSpace(
          client.spaces().length > 0 ? (
            client.spaces()[0].did()
          ) : (
            await client.createSpace("example space")
          )
        )
      }
    }
    ensureCurrentSpace()
  }, [client])

  if (client) {
    return children
  } else {
    return <Loader />
  }
}

function App() {
  return (
    <Provider>
      <Authenticator>
        <AuthenticationEnsurer>
          <SpaceEnsurer>
            <Uploader>
              <UploaderForm />
            </Uploader>
          </SpaceEnsurer>
        </AuthenticationEnsurer>
      </Authenticator>
    </Provider>
  )
}

export default App

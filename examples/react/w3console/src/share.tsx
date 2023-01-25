import { useEffect, useState } from 'react'
import { useKeyring } from '@w3ui/react-keyring'
import * as DID from '@ipld/dag-ucan/did'
import { CarWriter } from '@ipld/car/writer'

const Header = ({children}) => <h3 className='font-semibold text-xs font-mono uppercase tracking-wider mb-4 text-gray-400'>{children}</h3>

/**
 * @param {Agent} agent
 * @param {string} audienceDID
 * @param {object} opts
 * @param {string[]|string} opts.can
 * @param {string} [opts.name]
 * @param {string} [opts.type]
 * @param {number} [opts.expiration]
 * @param {string} [opts.output]
 */
export async function createDelegation (agent, audience, opts) {
  const abilities = Array.isArray(opts.can) ? opts.can : [opts.can]
  const audienceMeta = {}
  if (opts.name) audienceMeta.name = opts.name
  if (opts.type) audienceMeta.type = opts.type
  const expiration = opts.expiration || Infinity
  return agent.delegate({
    audience,
    abilities,
    expiration
  })
}

export async function toCarBlob (delegation) {
  const { writer, out } = CarWriter.create()
  for (const block of delegation.export()) {
    writer.put(block)
  }
  writer.close()
  
  const carParts = []
  for await (const chunk of out) {
    carParts.push(chunk)
  }
  const car = new Blob(carParts, {
    type: 'vnd.ipld.car',
  })
  return car
}

export function SpaceShare (): JSX.Element {
  const [{ agent }] = useKeyring()
  const [value, setValue] = useState('')
  const [downloadUrl, setDownloadUrl] = useState('')

  async function makeDownloadLink (input) {
    console.log('input', input)
    let audience
    try {
      audience = DID.parse(input.trim())
    } catch (err) {
      console.log('nope', input)
      setDownloadUrl('')
      return
    }

    try {
      const delegation = await createDelegation(agent, audience, { can: '*' })
      const blob = await toCarBlob(delegation)
      const url = URL.createObjectURL(blob)
      setDownloadUrl(url)
      console.log(url)
    } catch (err) {
      throw new Error('failed to register', { cause: err })
    }
  }

  function onSubmit (e: React.FormEvent<HTMLFormElement>): void {
    console.log('on submit', value)
    e.preventDefault()
    makeDownloadLink(value)
  }

  async function onChange (e: ChangeEvent<HTMLInputElement>): void {
    const input = e.target.value
    await makeDownloadLink(input)
    setValue(input)
  }

  return (
    <div className='pt-12'>
      <div className=''>
        <Header>Share your space</Header>
        <p className='mb-4'>Ask your friend for their Decentralized Identifier (DID) and paste it in below</p>
        <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => { void onSubmit(e) }} >
          <input
            className='text-black px-2 py-2 rounded block mb-4 w-full max-w-4xl font-mono text-sm'
            type='pattern' pattern="did:.+" placeholder='did:'
            value={value}
            onChange={onChange}
          />
          <a className='w3ui-button text-center block w-52 opacity-30' style={{opacity: downloadUrl ? '1' : '0.2' }} href={'' || downloadUrl} download={ downloadUrl && `did-${value.split(':').at(1)}-${value.split(':').at(2)?.substring(0, 10)}.ucan`}>Download UCAN</a>
        </form>
      </div>
      <div className='mt-16 py-16 border-t border-gray-700'>
        <Header>Import a space</Header>
        <p className='mb-2'>Copy and paste your DID to your friend</p>
        <div className='bg-opacity-10 bg-white font-mono text-sm py-2 px-3 rounded break-words max-w-4xl'>{agent.did()}</div>
      </div>
    </div>
  )
}
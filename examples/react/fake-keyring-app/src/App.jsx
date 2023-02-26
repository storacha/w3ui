import { useRef, useEffect } from 'react'
import './App.css'

function log(...args){
  console.log(window.location.toString() + " ", ...args)
}

function KeyringUserApp () {
  const keyringRef = useRef()
  function requestKeys () {
    keyringRef.current.contentWindow.postMessage("gimme the keys", "http://localhost:3001")
  }

  useEffect(function () {
    window.addEventListener("message", (event) => {
      log(`app received "${event.data}" from keyring domain`)
      // TODO: replace this with keyring site URL
      if (event.origin !== "http://localhost:3001")
        return;

      log("TODO: stash UCAN somewhere and send it along with requests (?)")
    }, false);
  }, [])

  return (
    <div className="App">
      <iframe style={{ display: 'none' }} ref={keyringRef} src="http://localhost:3001" />
      <h1>Keyring Playground</h1>
      <div className="card">
        <button onClick={() => requestKeys()}>
          grab the keys!
        </button>
      </div>
    </div>
  )
}

export default KeyringUserApp

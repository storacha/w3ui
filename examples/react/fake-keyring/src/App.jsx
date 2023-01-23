import { useEffect } from 'react'
import './App.css'

function respondToOpener(event, message){
  log("responding with " + message)
  window.parent.postMessage(message, event.origin)
}

function log(...args){
  console.log(window.location.toString() + " ", ...args)
}

function KeyringApp () {
  useEffect(function () {
    log("adding message listener")
    window.addEventListener("message", (event) => {
      log("keyring received", event.data, "from app domain")
      // TODO: I think we actually need to let anyone message us?
      if (event.origin !== "http://localhost:3000")
        return;

      log("TODO: aquire delegation granting keyring agent access to w3up service on app domain (probably needs a full email confirmation flow?)")
      log("TODO: create UCAN delegating access to w3up on app domain from keyring agent to app domain agent")
      respondToOpener(event, "TODO: sending UCAN delegation back to app domain")
    }, false);
  }, [])
  return (
    <div>
    </div>
  )
}

export default KeyringApp

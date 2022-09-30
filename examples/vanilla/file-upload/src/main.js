import './assets/tachyons.min.css'
import { RegisterForm } from './register'
import { UploadFileForm } from './upload'

export const EVENTS = {
  registrationSuccess: "registration:success",
};

const SELECTORS = {
  registerComponent: '#register-form-component',
  uploadComponent: '#upload-form-component',
}

document.addEventListener(EVENTS.registrationSuccess, (event) => {
  console.log('I HEAR YOU', event);
  const registerEl = document.querySelector(SELECTORS.registerComponent);
  // Switch components
  registerEl.remove();
  const uploadEl = document.createElement("upload-form")
  document.body.appendChild(uploadEl);
})

// Create a listener for the sign in complete event

export {
  RegisterForm,
  UploadFileForm,
}
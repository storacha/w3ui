import { EVENTS } from './main'

const SELECTORS = {
  uploadForm: '#upload-form',
  uploadFormTemplate: '#upload-form-template',
  encodingTemplate: '#file-encoding-template',
  uploadingTemplate: '#file-uploading-template',
  uploadCompleteTemplate: '#upload-complete-template',
  uploadErrorTemplate: '#upload-error-template',
}

export class UploadFileForm extends HTMLElement {
  constructor() {
    super();
    // this.identity = null;
    // this.email = null;
    this.form$ = document.querySelector(SELECTORS.uploadForm);
    this.uploadFormTemplate$ = document.querySelector(SELECTORS.uploadFormTemplate);
    this.encodingTemplate$ = document.querySelector(SELECTORS.encodingTemplate);
    this.uploadingTemplate$ = document.querySelector(SELECTORS.uploadingTemplate);
    this.uploadCompleteTemplate$ = document.querySelector(SELECTORS.uploadCompleteTemplate);
    this.uploadErrorTemplate$ = document.querySelector(SELECTORS.uploadErrorTemplate);

    // this.submitHandler = this.submitHandler.bind(this);
    // this.cancelRegistrationHandler = this.cancelRegistrationHandler.bind(this);
    // this.signOutHandler = this.signOutHandler.bind(this);
    // this.formatTemplateContent = this.formatTemplateContent.bind(this);
  }
}

customElements.define("upload-form", UploadFileForm);

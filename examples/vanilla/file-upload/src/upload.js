import { EVENTS } from './main'
import { loadDefaultIdentity } from '@w3ui/wallet-core'
import { uploadCarChunks, encodeFile, chunkBlocks, encodeDirectory } from '@w3ui/uploader-core'

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
    this.formatTemplateContent = this.formatTemplateContent.bind(this);
  }

  async handleFileUpload(event) {
    event.preventDefault();
    const fileInputEl = this.form$.querySelector("input[type=file");
    const file = fileInputEl.files[0];
    this.file = file;

    this.identity = await loadDefaultIdentity();

    if (this.identity) {
      console.log(`DID2: ${this.identity.signingPrincipal.did()}`)
    } else {
      console.log('No identity registered2')
    }

    try {
      this.toggleEncoding();
      const { cid, blocks } = await encodeFile(file);
      const chunks = await chunkBlocks(blocks);
      this.toggleUploading();
      await uploadCarChunks(this.identity.signingPrincipal, chunks)
      this.cid = await cid;
    } catch(error) {
      this.toggleUploadError();
    } finally {
      this.toggleUploadComplete();
    }
  }

  toggleEncoding() {
    const templateContent = this.encodingTemplate$.content;
    this.replaceChildren(this.formatTemplateContent(templateContent));
  }

  toggleUploading() {
    const templateContent = this.uploadingTemplate$.content;
    this.replaceChildren(this.formatTemplateContent(templateContent));
  }

  toggleUploadComplete() {
    const templateContent = this.uploadCompleteTemplate$.content;
    this.replaceChildren(this.formatTemplateContent(templateContent));
  }

  toggleUploadError() {
    const templateContent = this.uploadErrorTemplate$.content;
    this.replaceChildren(this.formatTemplateContent(templateContent));
  }

  formatTemplateContent(templateContent) {
    let slot;
    slot = templateContent.querySelector('[data-root-cid-slot]')
    if (slot) {
      slot.innerText = this.cid;
    }
    slot = templateContent.querySelector('[data-file-name-slot]')
    if (slot) {
      slot.innerText = this.file.name;
    }
    slot = templateContent.querySelector('[data-error-messages-slot]')
    if (slot) { 
      slot.innerText = this.errors;
    }
    return templateContent
  }

  async connectedCallback() {
    const templateContent = this.uploadFormTemplate$.content;
    this.replaceChildren(templateContent);
    this.handleFileUpload = this.handleFileUpload.bind(this);
    this.form$ = document.querySelector(SELECTORS.uploadForm);
    this.form$.addEventListener("submit", this.handleFileUpload);
  }

  disconnectedCallback() {
    this.form$.removeEventListener("submit", this.handleFileUpload);
  }
}

customElements.define("upload-form", UploadFileForm);

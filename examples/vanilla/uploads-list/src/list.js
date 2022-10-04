import { listUploads } from '@w3ui/uploads-list-core'
import { loadDefaultIdentity } from '@w3ui/wallet-core'

const SELECTORS = {
  listTemplate: '#list',
  listItemTemplate: '#list-item',
  error: '.list-error',
  table: 'table'
}

export class ListFiles extends window.HTMLElement {
  constructor () {
    super()
    this.listTemplate$ = document.querySelector(SELECTORS.listTemplate)
    this.listItemTemplate$ = document.querySelector(SELECTORS.listItemTemplate)
    this.listErrorTemplate$ = document.querySelector(SELECTORS.listErrorTemplate)
  }

  async connectedCallback () {
    this.appendChild(this.listTemplate$?.content.cloneNode(true))
    this.table = this.querySelector(SELECTORS.table)
    this.error = this.querySelector(SELECTORS.error)

    this.tbody = this.querySelector('tbody')

    this.identity = await loadDefaultIdentity()
    if (!this.identity) {
      throw Error('Trying to upload but identity is missing')
    }
    this.updateList()
  }

  async updateList () {
    try {
      const files = (await listUploads(this.identity.signingPrincipal)).results
      const fileElements = files.map((file) => this.renderFileRow(file))
      this.tbody.append(...fileElements)
      this.toggleError(false)
    } catch (err) {
      this.toggleError(true)
      throw new Error('failed to list uploads', { cause: err })
    }
  }

  toggleError (showError) {
    this.table.hidden = showError
    this.error.hidden = !showError
  }

  renderFileRow (file) {
    const item = this.listItemTemplate$?.content.cloneNode(true)
    const columns = item.querySelectorAll('td')
    columns[0].textContent = file.dataCid
    columns[1].textContent = file.carCids[0]
    columns[2].textContent = new Date(file.uploadedAt).toLocaleString()
    return item
  }
}

window.customElements.define('list-files', ListFiles)

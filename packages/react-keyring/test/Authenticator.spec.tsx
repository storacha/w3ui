import React from 'react'
import { test, expect, vi, beforeEach, afterEach } from 'vitest'
import 'fake-indexeddb/auto'
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react' // (or /dom, /vue, ...)
import { unmountComponentAtNode } from 'react-dom'
import { act } from 'react-dom/test-utils'

import { KeyringContext, keyringContextDefaultValue, KeyringContextValue } from '../src/providers/Keyring'
import { Authenticator, CancelButton, Form, EmailInput } from '../src/index'

let container: HTMLDivElement = document.createElement('div')
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement('div')
  document.body.appendChild(container)
})

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container)
  container.remove()
})

test('CancelButton', async () => {
  const user = userEvent.setup()

  const cancelRegisterSpace = vi.fn()
  const contextValue: KeyringContextValue = [
    keyringContextDefaultValue[0],
    { ...keyringContextDefaultValue[1], cancelRegisterSpace }
  ]
  act(() => {
    render((
      <KeyringContext.Provider value={contextValue}>
        <Authenticator>
          <CancelButton>Cancel</CancelButton>
        </Authenticator>
      </KeyringContext.Provider>
    ), container)
  })

  const cancelButton = screen.getByRole('button')
  expect(cancelButton.textContent).toBe('Cancel')
  await user.click(cancelButton)

  expect(cancelRegisterSpace).toHaveBeenCalledOnce()
})

test('Form', async () => {
  const user = userEvent.setup()

  const createSpace = vi.fn()
  const registerSpace = vi.fn()

  const contextValue: KeyringContextValue = [
    keyringContextDefaultValue[0],
    {
      ...keyringContextDefaultValue[1],
      createSpace,
      registerSpace
    }
  ]
  act(() => {
    render((
      <KeyringContext.Provider value={contextValue}>
        <Authenticator>
          <Form>
            <EmailInput placeholder='Email' />
            <button type='submit' value='Create Space' data-testid='submit' />
          </Form>
        </Authenticator>
      </KeyringContext.Provider>
    ), container)
  })

  const myEmail = 'travis@dag.house'
  const emailInput = screen.getByPlaceholderText('Email')
  await user.click(emailInput)
  await user.keyboard(myEmail)

  const submitButton = screen.getByTestId('submit')
  expect(submitButton.value).toBe('Create Space')
  await user.click(submitButton)

  expect(createSpace).toHaveBeenCalledOnce()
  expect(registerSpace).toHaveBeenCalledWith(myEmail)
})

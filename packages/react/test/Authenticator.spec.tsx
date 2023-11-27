import React from 'react'
import 'fake-indexeddb/auto'
import { test, expect, vi } from 'vitest'
import user from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import { Context, ContextDefaultValue, ContextValue } from '../src/providers/Provider'
import { Authenticator } from '../src/Authenticator'

test('CancelButton', async () => {
  const cancelLogin = vi.fn()
  const contextValue: ContextValue = [
    ContextDefaultValue[0],
    { ...ContextDefaultValue[1], cancelLogin }
  ]
  render(
    <Context.Provider value={contextValue}>
      <Authenticator>
        <Authenticator.CancelButton>Cancel</Authenticator.CancelButton>
      </Authenticator>
    </Context.Provider>
  )

  const cancelButton = screen.getByText('Cancel')
  await user.click(cancelButton)

  expect(cancelLogin).toHaveBeenCalledOnce()
})

test('Form', async () => {
  const login = vi.fn()

  const contextValue: ContextValue = [
    {
      ...ContextDefaultValue[0],
      // @ts-expect-error not a real client
      client: { login }
    },
    ContextDefaultValue[1]
  ]
  render(
    <Context.Provider value={contextValue}>
      <Authenticator>
        <Authenticator.Form>
          <Authenticator.EmailInput placeholder='Email' />
          <input type='submit' value='Login' />
        </Authenticator.Form>
      </Authenticator>
    </Context.Provider>
  )

  const myEmail = 'travis@dag.house'
  const emailInput = screen.getByPlaceholderText('Email')
  await user.click(emailInput)
  await user.keyboard(myEmail)

  const submitButton = screen.getByText('Login')
  await user.click(submitButton)

  expect(login).toHaveBeenCalledOnce()
})

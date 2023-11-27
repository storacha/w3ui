import React from 'react'
import 'fake-indexeddb/auto'
import { test, expect, vi } from 'vitest'
import user from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import { Context, ContextDefaultValue } from '../src/providers/Provider'
import {
  UploaderContext,
  UploaderContextValue,
  UploaderContextDefaultValue,
  Uploader
} from '../src/Uploader'

test('Form', async () => {
  const setFile = vi.fn()

  const contextValue: UploaderContextValue = [
    UploaderContextDefaultValue[0],
    {
      ...UploaderContextDefaultValue[1],
      setFile
    }
  ]
  render(
    <Context.Provider value={ContextDefaultValue}>
      <UploaderContext.Provider value={contextValue}>
        <Uploader>
          <Uploader.Form>
            <Uploader.Input data-testid='file-upload' />
            <input type='submit' value='Upload' />
          </Uploader.Form>
        </Uploader>
      </UploaderContext.Provider>
    </Context.Provider>
  )

  const file = new File(['hello'], 'hello.txt', { type: 'text/plain' })

  const fileInput = screen.getByTestId('file-upload')
  await user.upload(fileInput, file)

  const submitButton = screen.getByText('Upload')
  await user.click(submitButton)

  expect(setFile).toHaveBeenCalledWith(file)
})

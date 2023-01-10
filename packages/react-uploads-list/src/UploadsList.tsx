import type { As, Component, Props, Options } from 'ariakit-react-utils'
import type { UploadsListContextState, UploadsListContextActions } from '@w3ui/uploads-list-core'

import React, { Fragment, createContext, useContext, useMemo, useCallback } from 'react'
import { createComponent, createElement } from 'ariakit-react-utils'
import { useUploadsList } from './providers/UploadsList'

export type UploadsListComponentContextState = UploadsListContextState & {

}

export type UploadsListComponentContextActions = UploadsListContextActions & {

}

export type UploadsListComponentContextValue = [
  state: UploadsListComponentContextState,
  actions: UploadsListComponentContextActions
]

export const UploadsListComponentContext = createContext<UploadsListComponentContextValue>([
  {
    /**
     * A boolean indicating whether the uploads list
     * is currently loading data from the server.
     */
    loading: false
  },
  {
    /**
     * A function that will load the next page of results.
     */
    next: async () => { },
    /**
     * A function that will reload the uploads list.
     */
    reload: async () => { }
  }
])

export type UploadsListRootOptions<T extends As = typeof Fragment> = Options<T>
export type UploadsListRootProps<T extends As = typeof Fragment> = Props<UploadsListRootOptions<T>>

/**
 * Top level component of the headless UploadsList.
 *
 * Designed to be used with UploadsList.NextButton,
 * Uploader.ReloadButton, et al to easily create a
 * custom component for listing uploads to a web3.storage space.
 */
export const UploadsListRoot: Component<UploadsListRootProps> = createComponent(props => {
  const [state, actions] = useUploadsList()
  const contextValue = useMemo<UploadsListComponentContextValue>(
    () => ([state, actions]),
    [state, actions])
  return (
    <UploadsListComponentContext.Provider value={contextValue}>
      {createElement(Fragment, { ...props, uploadsList: contextValue })}
    </UploadsListComponentContext.Provider>
  )
})

export type NextButtonOptions<T extends As = 'button'> = Options<T>
export type NextButtonProps<T extends As = 'button'> = Props<NextButtonOptions<T>>

/**
 * Button that loads the next page of results.
 *
 * A 'button' designed to work with `UploadsList`. Any passed props will
 * be passed along to the `button` component.
 */
export const NextButton: Component<NextButtonProps> = createComponent((props: any) => {
  const [, { next }] = useContext(UploadsListComponentContext)
  const onClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    void next()
  }, [next])
  return createElement('button', { ...props, onClick })
})

export type ReloadButtonOptions<T extends As = 'button'> = Options<T>
export type ReloadButtonProps<T extends As = 'button'> = Props<ReloadButtonOptions<T>>

/**
 * Button that reloads an `UploadsList`.
 *
 * A 'button' designed to work with `UploadsList`. Any passed props will
 * be passed along to the `button` component.
 */
export const ReloadButton: Component<ReloadButtonProps> = createComponent((props: any) => {
  const [, { reload }] = useContext(UploadsListComponentContext)
  const onClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    void reload()
  }, [reload])
  return createElement('button', { ...props, onClick })
})

/**
 * Use the scoped uploads list context state from a parent `UploadsList`.
 */
export function useUploadsListComponent (): UploadsListComponentContextValue {
  return useContext(UploadsListComponentContext)
}

export const UploadsList = Object.assign(UploadsListRoot, { NextButton, ReloadButton })

import React, { createContext, useContext, useMemo, useCallback } from 'react'
import { UploadsListContextState, UploadsListContextActions } from '@w3ui/uploads-list-core'
import { useUploadsList } from './providers/UploadsList'

export type UploadsListComponentContextState = UploadsListContextState & {

}

export type UploadsListComponentContextActions = UploadsListContextActions & {

}

export type UploadsListComponentContextValue = [
  state: UploadsListComponentContextState,
  actions: UploadsListContextActions
]

export const UploadsListComponentContext = createContext<UploadsListComponentContextValue>([
  {
    loading: false
  },
  {
    next: async () => { },
    reload: async () => { }
  }
])

export type UploadsListComponentChildrenProps = [
  state: UploadsListContextState,
  actions: UploadsListComponentContextActions
]

export interface UploadsListComponentProps {
  children?: (props: UploadsListComponentChildrenProps) => React.ReactNode
}

/**
 * Top level component of the headless UploadsList.
 *
 * Designed to be used with UploadsList.NextButton,
 * Uploader.ReloadButton, et al to easily create a
 * custom component for listing uploads to a web3.storage space.
 */
export const UploadsList = ({ children }: UploadsListComponentProps): JSX.Element => {
  const [state, actions] = useUploadsList()
  const contextValue = useMemo<UploadsListComponentChildrenProps>(
    () => ([state, actions]),
    [state, actions])
  return (
    <UploadsListComponentContext.Provider value={contextValue}>
      {(typeof children === 'function')
        ? (
            children(contextValue)
          )
        : (
            children
          )}
    </UploadsListComponentContext.Provider>
  )
}

/**
 * Button that loads the next page of results.
 *
 * A 'button' designed to work with `UploadsList`. Any passed props will
 * be passed along to the `button` component.
 */
UploadsList.NextButton = (props: any) => {
  const [, { next }] = useContext(UploadsListComponentContext)
  const onClick = useCallback(function onClick (e: React.MouseEvent) {
    e.preventDefault()
    void next()
  }, [next])
  return <button onClick={onClick} {...props} />
}

/**
 * Button that reloads an `UploadsList`.
 *
 * A 'button' designed to work with `UploadsList`. Any passed props will
 * be passed along to the `button` component.
 */
UploadsList.ReloadButton = (props: any) => {
  const [, { reload }] = useContext(UploadsListComponentContext)
  const onClick = useCallback(function onClick (e: React.MouseEvent) {
    e.preventDefault()
    void reload()
  }, [reload])
  return <button onClick={onClick} {...props} />
}

/**
 * Use the scoped uploads list context state from a parent `UploadsList`.
 */
export function useUploadsListComponent (): UploadsListComponentContextValue {
  return useContext(UploadsListComponentContext)
}

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

export type UploadsListComponentProps = {
  children?: ({ }: UploadsListComponentChildrenProps) => React.ReactNode,
}

export const UploadsList = ({ children }: UploadsListComponentProps) => {
  const [state, actions] = useUploadsList()
  const contextValue = useMemo<UploadsListComponentChildrenProps>(
    () => ([state, actions]),
    [state, actions])
  return (
    <UploadsListComponentContext.Provider value={contextValue}>
      {(typeof children === 'function') ? (
        children(contextValue)
      ) : (
        children
      )}
    </UploadsListComponentContext.Provider>
  )
}

UploadsList.NextButton = (props: any) => {
  const [, { next }] = useContext(UploadsListComponentContext)
  const onClick = useCallback(function onClick(e: React.MouseEvent) {
    e.preventDefault()
    next()
  }, [next])
  return <button onClick={onClick} {...props} />
}

UploadsList.ReloadButton = (props: any) => {
  const [, { reload }] = useContext(UploadsListComponentContext)
  const onClick = useCallback(function onClick(e: React.MouseEvent) {
    e.preventDefault()
    reload()
  }, [reload])
  return <button onClick={onClick} {...props} />
}

export function useUploadsListComponent(): UploadsListComponentContextValue {
  return useContext(UploadsListComponentContext)
}


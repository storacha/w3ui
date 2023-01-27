import React, { useContext, createContext, useState, useEffect } from 'react'
import { UploadListResult, UploadsListContextState, UploadsListContextActions, ServiceConfig, list } from '@w3ui/uploads-list-core'
import { useKeyring } from '@w3ui/react-keyring'
import { list as uploadList } from '@web3-storage/capabilities/upload'

export type UploadsListContextValue = [
  state: UploadsListContextState,
  actions: UploadsListContextActions
]

export const uploadsListContextDefaultValue: UploadsListContextValue = [
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
    reload: async () => { },
    /**
     * A function that will change the page size of the uploads list.
     */
    setPageSize: () => { }
  }
]

export const UploadsListContext = createContext<UploadsListContextValue>(uploadsListContextDefaultValue)

export interface UploadsListProviderProps extends ServiceConfig {
  children?: JSX.Element
  /**
   * Maximum number of items to return per page.
   */
  pageSize?: number
}

/**
 * Provider for a list of items uploaded to the current space.
 */
export function UploadsListProvider ({ pageSize, servicePrincipal, connection, children }: UploadsListProviderProps): JSX.Element {
  const [{ space, agent }, { getProofs }] = useKeyring()
  const [currentPageSize, setPageSize] = useState<number | undefined>(pageSize)
  const [cursor, setCursor] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error>()
  const [data, setData] = useState<UploadListResult[]>()
  const [controller, setController] = useState(new AbortController())

  const loadPage = async (cursor?: string): Promise<void> => {
    if (space == null) return
    if (agent == null) return

    controller.abort()
    const newController = new AbortController()
    setController(newController)
    setLoading(true)

    try {
      const conf = {
        issuer: agent,
        with: space.did(),
        audience: servicePrincipal,
        proofs: await getProofs([{ can: uploadList.can, with: space.did() }])
      }
      const page = await list(conf, {
        cursor,
        size: currentPageSize,
        signal: newController.signal,
        connection
      })
      setCursor(page.cursor)
      setData(page.results)
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error(err)
        setError(new Error('failed to fetch uploads list', { cause: err }))
      }
    } finally {
      setLoading(false)
    }
  }

  const state = { data, loading, error }
  const actions = {
    next: async (): Promise<void> => { await loadPage(cursor) },
    reload: async (): Promise<void> => {
      setCursor(undefined)
      await loadPage()
    },
    setPageSize
  }

  // we should reload the page any time the space or agent change
  useEffect(() => { void loadPage() }, [space, agent, currentPageSize])

  return (
    <UploadsListContext.Provider value={[state, actions]}>
      {children}
    </UploadsListContext.Provider>
  )
}

interface UseUploadsListProps {
  pageSize?: number
}

/**
 * Use the scoped uploads list context state from a parent `UploadsListProvider`.
 */
export function useUploadsList ({ pageSize }: UseUploadsListProps = {}): UploadsListContextValue {
  const ctx = useContext(UploadsListContext)
  if (pageSize !== undefined) {
    ctx[1].setPageSize(pageSize)
  }
  return ctx
}

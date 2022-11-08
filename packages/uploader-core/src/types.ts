import type { Link, UnknownLink, Version } from 'multiformats/link'
import type { Block } from '@ipld/unixfs'
import { CAR } from '@ucanto/transport'

export interface UnixFSEncodeResult {
  /**
   * Root CID for the DAG.
   */
  cid: UnknownLink
  /**
   * Blocks for the generated DAG.
   */
  blocks: Block[]
}

/**
 * Information present in the CAR file header.
 */
export interface CARHeaderInfo {
  /**
   * CAR version number.
   */
  version: number
  /**
   * Root CIDs present in the CAR header.
   */
  roots: Array<Link<unknown, number, number, Version>>
}

/**
 * A DAG encoded as a CAR.
 */
export interface CARFile extends CARHeaderInfo, Blob {}

/**
 * An IPLD Link that has the CAR codec code.
 */
export type CARLink = Link<unknown, typeof CAR.codec.code>

/**
 * Metadata pertaining to a CAR file.
 */
export interface CARMetadata extends CARHeaderInfo {
  /**
   * CID of the CAR file (not the data it contains).
   */
  cid: CARLink
  /**
   * Size of the CAR file in bytes.
   */
  size: number
}

export interface Retryable {
  retries?: number
}

export interface Abortable {
  signal?: AbortSignal
}

# `@w3ui/uploader-core`

## Install

```sh
npm install @w3ui/uploader-core
```

## Usage

```js
import * as UploaderCore from '@w3ui/uploader-core'
```

## Exports

* [`encodeCAR`](#encodecar)
* [`encodeDirectory`](#encodedirectory)
* [`encodeFile`](#encodefile)
* [`registerUpload`](#registerupload)
* [`storeDAG`](#storedag)

---

### `encodeCAR`

```ts
encodeCAR (blocks: Iterable<Block>, root?: CID): Promise<Blob & { version: 1, roots: CID[] }>
```

Encode a DAG as a CAR file.

Example:

```js
const { cid, blocks } = await encodeFile(new File(['data'], 'doc.txt'))
const car = await encodeCAR(blocks, cid)
```

### `encodeDirectory`

```ts
encodeDirectory (files: Iterable<File>): { cid: CID, blocks: Block[] }
```

Create a UnixFS DAG from the passed file data. All files are added to a container directory, with paths in file names preserved.

Example:

```js
const { cid, blocks } = encodeDirectory([
  new File(['doc0'], 'doc0.txt'),
  new File(['doc1'], 'dir/doc1.txt'),
])
// DAG structure will be:
// bafybei.../doc0.txt
// bafybei.../dir/doc1.txt
```

### `encodeFile`

```ts
encodeFile (file: Blob): { cid: CID, blocks: Block[] }
```

Create a UnixFS DAG from the passed file data.

Example:

```js
const { cid, blocks } = await encodeFile(new File(['data'], 'doc.txt'))
// Note: file name is not preserved - use encodeDirectory if required.
```

### `registerUpload`

```ts
registerUpload (account: DID, signer: Signer, root: CID, shards: CID[], options: { retries?: number, signal?: AbortSignal } = {}): Promise<void>
```

Register a set of stored CAR files as an "upload" in the system. A DAG can be split between multipe CAR files. Calling this function allows multiple stored CAR files to be considered as a single upload.

### `storeDAG`

```ts
storeDAG (account: DID, signer: Signer, car: Blob, options: { retries?: number, signal?: AbortSignal } = {}): Promise<CID>
```

Store a CAR file to the service.

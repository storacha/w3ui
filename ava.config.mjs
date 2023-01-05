export default {
  files: [
    'test/**',
    '!test/utils/'
  ],
  extensions: {
    ts: 'module'
  },
  nodeArguments: [
    '--loader=ts-node/esm'
  ]
}

export default {
  files: [
    "test/**",
    "!test/utils/"
  ],
  extensions: {
    ts: 'module'
  },
  nodeArguments: [
    '--no-warnings',
    '--loader=ts-node/esm',
  ]
}

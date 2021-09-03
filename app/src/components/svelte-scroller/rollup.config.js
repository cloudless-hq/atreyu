import svelte from 'rollup-plugin-svelte'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import pkg from './package.json'

export default [
  {
    input: 'src/VirtualList.html',
    output: [
      { file: pkg.module, 'format': 'es' },
      { file: pkg.main, 'format': 'umd', name: 'VirtualList' }
    ],
    plugins: [
      resolve(),
      svelte()
    ]
  },

  // tests
  {
    input: 'test/src/index.js',
    output: {
      file: 'test/public/bundle.js',
      format: 'iife'
    },
    plugins: [
      resolve(),
      commonjs(),
      svelte()
    ]
  }
]

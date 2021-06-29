import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

import fs from 'fs'

const deps = fs.readdirSync('./app/src/deps')

export default deps.map((name) =>
  ({
    // treeshake: true,
    input: `./app/src/deps/${name}`,
    output: {
      file:  `./app/build/deps/${name}`,
      format: 'esm',
      // compact: true,
      // minifyInternalExports: true,
      sourcemap: false
    },
    plugins: [
      nodeResolve({
        preferBuiltins: false,
        browser: true
      }),
      commonjs()
    ]
  })
)
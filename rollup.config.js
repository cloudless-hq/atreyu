import { nodeResolve } from '@rollup/plugin-node-resolve'
// import nodePolyfills from 'rollup-plugin-node-polyfills'
import commonjs from '@rollup/plugin-commonjs'
// import json from '@rollup/plugin-json'
import replace from '@rollup/plugin-replace'

import fs from 'fs'

const deps = fs.readdirSync('./app/src/deps')

export default [...deps.map((name) =>
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
      replace({
        preventAssignment: false,
        values: { 'process.env.FALCOR_OBSERVABLE_NO_CATCH': 'false' } // TODO: fix falcor and remove this
      }),
      nodeResolve({
        preferBuiltins: false,
        browser: true
      }),
      commonjs()
    ]
  }))]

// {
//   input: `./deps-node.js`,
//   external: ['chokidar' ], // ,'fs',  'acorn', 'fsevents', 'path', , 'crypto', 'assert', 'stream', 'util', 'url', 'os'],
//   output: {
//     file:  `./deps-node.build.js`,
//     format: 'esm',
//     sourcemap: false
//   },
//   plugins: [
//     replace({
//       preventAssignment: false,
//       values: { "'chokidar'": "'./chokidar-stub.js'" } // TODO: fix falcor and remove this
//       // // glob_1.Glob;
//     }),
//     json(),
//     commonjs(),
//     nodePolyfills(),
//     nodeResolve({
//       preferBuiltins: false,
//       mainFields: ['browser', 'main']
//     })
//   ]
// }]


import rpi_resolve from '@rollup/plugin-node-resolve'

export default {
  plugins: [rpi_resolve()],
  input: 'code/wc.mjs',
  output: {
    dir: 'esm/',
    format: 'es',
    sourcemap: false, // turn sourcemap off for github.io page publishing
  },
}

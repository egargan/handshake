import commonJS from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve';
import serve from "rollup-plugin-serve";
import copy from 'rollup-plugin-copy'

const BUILDDIR = 'build'

export default {
    input: 'src/demo/index.js',
    output: {
        file: `${BUILDDIR}/bundle.js`,
        format: 'iife',
        sourcemap: true
    },
    watch: {
        include: 'src/**',
    },
    plugins: [
        commonJS(),
        resolve({
            customResolveOptions: {
                moduleDirectory: 'node_modules'
            }
        }),
        copy({
          targets: [
            { src: 'src/demo/index.html', dest: BUILDDIR },
            { src: 'assets', dest: BUILDDIR },
          ],
        }),
        serve({ contentBase: BUILDDIR, port: 5000 }),
    ],
};

import commonJS from 'rollup-plugin-commonjs'
import resolve from 'rollup-plugin-node-resolve';
import serve from "rollup-plugin-serve";
import copy from 'rollup-plugin-copy'

const BUILDDIR = 'build'

export default {
    input: 'src/main.js',
    output: {
        file: `${BUILDDIR}/bundle.js`,
        format: 'iife',
        sourcemap: true
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
            { src: 'src/index.html', dest: BUILDDIR },
            { src: 'assets', dest: BUILDDIR },
          ],
        }),
        serve({ contentBase: BUILDDIR, port: 5000 }),
    ],
};

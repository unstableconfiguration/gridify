import copy from 'rollup-plugin-copy'
import del from 'rollup-plugin-delete';
import { terser } from 'rollup-plugin-terser'

export default {
    input: 'index.js',
    output: {
        file: 'dist/gridify.js',
        format: 'es'
    },
    plugins :[
        del({ targets: 'dist/*', verbose : true }),
        copy({
            targets : [
                { src : 'app/css/gridify.css', dest : 'dist' },
            ]
        }),
        terser()
    ]
}


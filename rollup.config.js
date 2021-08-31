import babel from '@rollup/plugin-babel';
import copy from 'rollup-plugin-copy'
import del from 'rollup-plugin-delete';

export default {
    input: 'index.js',
    output: {
        file: 'dist/gridify.js',
        format: 'es'
    },
    plugins :[
        del({ targets: 'dist/*', verbose : true }),
        babel({ babelHelpers: 'bundled' }),
        copy({
            targets : [
                { src : 'app/css/gridify.css', dest : 'dist' },
            ]
        })
    ]
}


import babel from '@rollup/plugin-babel';
import copy from 'rollup-plugin-copy'
import del from 'rollup-plugin-delete';

export default [
    {
        input: 'src/index.js',
        output: {
            file: 'dist/gridify.js',
            format: 'es'
        },
        plugins :[
            del({ targets: 'dist/*' }),
            babel({ babelHelpers: 'bundled' }),
            copy({
                targets : [
                    { src : 'dist/gridify.js', dest: 'gh-pages/scripts' },
                    { src : 'src/css/gridify.css', dest : 'dist' },
                    { src : 'src/css/gridify.css', dest : 'gh-pages/css'}
                ]
            })
        ]
    },
    {
        input : 'tests/tests.js',
        output : { 
            file : 'gh-pages/tests/gridify-tests.js',
            format : 'es'
        }
    }
];


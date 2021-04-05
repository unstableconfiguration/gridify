import babel from '@rollup/plugin-babel';
import copy from 'rollup-plugin-copy'
import del from 'rollup-plugin-delete';

export default [
    {
        input: 'src/index.js',
        output: [{
            file: 'dist/gridify.js',
            format: 'es'
        },
        {
            file : 'gh-pages/scripts/gridify.js',
            format : 'es'
        }],
        plugins :[
           del({ targets: [
                'dist/*', 
                'gh-pages/scripts/gridify.js',
                'gh-pages/css/gridify.css'
            ], verbose : true }),
            babel({ babelHelpers: 'bundled' }),
            copy({
                targets : [
                    { src : 'src/css/gridify.css', dest : 'dist' },
                    { src : 'src/css/gridify.css', dest : 'gh-pages/css'}
                ], verbose : true
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


export default [
    {
        input: 'src/index.js',
        output: {
            file: 'dist/gridify.js',
            format: 'es'
        }
    },
    {
        input : 'tests/tests.js',
        output : { 
            file : 'dist/gridify-tests.js',
            format : 'es'
        }
    }
];
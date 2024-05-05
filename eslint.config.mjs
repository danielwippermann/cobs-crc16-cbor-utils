import globals from 'globals';
import pluginJs from '@eslint/js';

export default [
    {
        files: [
            '**/*.js',
        ],
        languageOptions: {
            sourceType: 'commonjs',
        },
    }, {
        languageOptions: {
            globals: globals.node,
        },
    },
    pluginJs.configs.recommended,
    {
        rules: {
            'prefer-const': 'error',
            'quotes': [ 'error', 'single' ],
            'semi': [ 'error', 'always' ],
        },
    },
];

module.exports = {
    env: {
        node: true,
        browser: true,
        jquery: true,
    },
    root: true,
    parser: 'vue-eslint-parser',
    parserOptions: {
        parser: '@typescript-eslint/parser',
        sourceType: 'module'
    },
    plugins: [
        '@typescript-eslint',
        // 'vue',
    ],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:vue/recommended',
    ],
    rules: {
        indent: [
            'error',
            4,
            { SwitchCase: 1 }
        ],
        'linebreak-style': [
            'error',
            'windows'
        ],
        quotes: [
            'error',
            'single',
            { allowTemplateLiterals: true }
        ],
        semi: [
            'error',
            'always'
        ],
        'semi-spacing': [
            'error',
            { before: false, after: true }
        ],
        'no-var': 'error',
        'comma-dangle': [
            'error', {
                arrays: 'always-multiline',
                objects: 'always-multiline',
                imports: 'always-multiline',
                exports: 'always-multiline',
                functions: 'always-multiline',
                functions: 'never',
            },
        ],
        'require-atomic-updates': 'off',
        'object-curly-spacing': [
            'error',
            'always'
        ],
        'object-shorthand': 'error',
        'require-await': 'error',
        'no-trailing-spaces': 'error',
        'key-spacing': 'error',
        'keyword-spacing': 'error',
        'space-before-blocks': 'error',
        'padding-line-between-statements': [
            'error',
            { blankLine: 'always', prev: '*', next: 'return' },

            { blankLine: 'always', prev: 'directive', next: '*' },
            { blankLine: 'any', prev: 'directive', next: 'directive' },

            { blankLine: 'always', prev: '*', next: 'block-like' },
            { blankLine: 'always', prev: 'block-like', next: '*' },
        ],
        '@typescript-eslint/camelcase': [
            'error', 
            { properties: 'never' }
        ],
        'vue/html-indent': [
            'error', 
            4
        ],
        'vue/max-attributes-per-line': ['error', {
            singleline: 4,
            multiline: 1
        }]
    }
};
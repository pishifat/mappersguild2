module.exports = {
    env: {
        node: true,
        browser: true,
    },
    root: true,
    parser: 'vue-eslint-parser',
    parserOptions: {
        parser: '@typescript-eslint/parser',
        sourceType: 'module',
    },
    plugins: [
        '@typescript-eslint',
    ],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:vue/vue3-recommended',
    ],
    rules: {
        indent: [
            'error',
            4,
            { SwitchCase: 1 },
        ],
        'linebreak-style': [
            'error',
            'windows',
        ],
        quotes: [
            'error',
            'single',
            { allowTemplateLiterals: true },
        ],
        semi: [
            'error',
            'always',
        ],
        'semi-spacing': [
            'error',
            { before: false, after: true },
        ],
        'no-var': 'error',
        'comma-dangle': [
            'error', {
                arrays: 'always-multiline',
                objects: 'always-multiline',
                imports: 'always-multiline',
                exports: 'always-multiline',
                functions: 'never',
            },
        ],
        'require-atomic-updates': 'off',
        'object-curly-spacing': [
            'error',
            'always',
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
        'vue/html-indent': [
            'error',
            4,
        ],
        'vue/max-attributes-per-line': ['error', {
            singleline: 3,
            multiline: 1,
        }],
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
    },
};

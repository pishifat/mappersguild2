import globals from 'globals';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';

export default tseslint.config(
    {
        ignores: ['node_modules/**', 'dist/**', 'public/**', 'api/archives/**'],
    },

    js.configs.recommended,
    tseslint.configs.recommended,
    pluginVue.configs['flat/recommended'],

    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.browser,
            },
        },
    },

    {
        files: ['**/*.vue'],
        languageOptions: {
            parserOptions: {
                parser: tseslint.parser,
            },
        },
    },

    {
        files: ['**/*.{ts,js,vue}'],
        rules: {
            indent: [
                'error',
                4,
                { SwitchCase: 1 },
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
            'no-constant-binary-expression': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-use-before-define': 'error',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-require-imports': 'off',
        },
    },

    {
        files: ['**/*.vue'],
        rules: {
            'vue/html-indent': 'off',
            'vue/html-self-closing': ['error', {
                'html': {
                    'void': 'always',
                    'normal': 'always',
                    'component': 'always',
                },
                'svg': 'always',
                'math': 'always',
            }],
            'vue/max-attributes-per-line': ['error', {
                singleline: 3,
                multiline: 1,
            }],
            'vue/v-on-event-hyphenation': 'off',
        },
    }
);

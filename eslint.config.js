const simpleImportSort = require('eslint-plugin-simple-import-sort');
const tseslint = require('typescript-eslint');

// Flat config, discovered by ESLint from every package directory upwards, so the
// per-package `eslint "src/**/*.ts"` scripts all share these rules.
// `client` is excluded on purpose: it is linted through `next lint` with
// `eslint-config-next` and its own `.eslintrc.json`.
module.exports = tseslint.config(
    {
        ignores: [
            'client/**',
            '**/dist/**',
            '**/.next/**',
            '**/coverage/**',
        ],
    },
    ...tseslint.configs.recommended,
    {
        files: ['**/*.ts'],
        plugins: {
            'simple-import-sort': simpleImportSort,
        },
        rules: {
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-empty-function': 'off',
            '@typescript-eslint/no-inferrable-types': 'off',
            '@typescript-eslint/no-unused-vars': 'error',
            'semi': ['error', 'always'],
            'no-unexpected-multiline': 'error',
            'simple-import-sort/imports': 'error',
            'eol-last': ['error', 'always'],
            'no-trailing-spaces': 'error',
            'no-multi-spaces': 'error',
            'space-in-parens': 'error',
            'object-curly-spacing': ['error', 'always'],
            'no-multiple-empty-lines': ['error', { max: 1, maxBOF: 0 }],
            'max-len': ['error', { code: 120 }],
            'quotes': [
                'error',
                'single',
                {
                    avoidEscape: true,
                    allowTemplateLiterals: true,
                },
            ],
        },
    },
);

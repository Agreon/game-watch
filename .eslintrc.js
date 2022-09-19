module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: 'tsconfig.json',
        sourceType: 'module',
    },
    plugins: [
        '@typescript-eslint/eslint-plugin',
        'simple-import-sort'
    ],
    extends: [
        'plugin:@typescript-eslint/recommended'
    ],
    root: true,
    env: {
        node: true,
        jest: true,
    },
    ignorePatterns: ['.eslintrc.js'],
    rules: {
        '@typescript-eslint/interface-name-prefix': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-inferrable-types': 'off',
        "semi": ["error", "always"],
        "no-unexpected-multiline": "error",
        "simple-import-sort/imports": "error",
        "@typescript-eslint/no-unused-vars": "error",
        "eol-last": ["error", "always"],
        "no-trailing-spaces": "error",
        "no-multi-spaces": "error",
        "space-in-parens": "error",
        "object-curly-spacing": ["error", "always"],
        "no-multiple-empty-lines": ["error", { max: 1, maxBOF: 0 }],
        "max-len": ["warn", { code: 100 }],
        "quotes": [
            "error",
            "single",
            {
                "avoidEscape": true,
                "allowTemplateLiterals": true
            }
        ]
    },
};

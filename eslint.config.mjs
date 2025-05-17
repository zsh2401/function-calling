// @ts-check

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

// import {} from "@/"
export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    globalIgnores(['cjs/*', 'es/*', 'eslint.config.mjs']),
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            '@typescript-eslint/no-floating-promises':
                'error',
            '@typescript-eslint/no-unsafe-assignment':
                'off',
            '@typescript-eslint/require-await': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-member-access':
                'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            'require-await': 'warn',

            semi: 'off',
        },
    }
)

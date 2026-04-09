import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import ts from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import vueParser from 'vue-eslint-parser'
import globals from 'globals'

export default [
  // 基础 JS 规则
  js.configs.recommended,

  // ✅ 关键：加载 Vue 官方扁平配置（必须用这个写法）
  ...vue.configs['flat/essential'],

  // TS 规则（仅作用于 .ts 文件）
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        uni: 'readonly',
        getApp: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': ts
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-debugger': 'warn'
    }
  },

  // 全局声明文件：参数名仅作文档，放在 **/*.ts 之后以覆盖对该文件的规则
  {
    files: ['**/*.d.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': ts,
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
    },
  },

  // Vue 文件：vue-eslint-parser + TS 子解析，支持 <script setup lang="ts">
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.vue'],
      },
      globals: {
        ...globals.browser,
        uni: 'readonly',
        getApp: 'readonly',
        getCurrentPages: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': ts,
    },
    rules: {
      'no-debugger': 'warn',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },

  // 允许 console（不检查 console.log 等）
  {
    rules: {
      'no-console': 'off'
    }
  },

  // 忽略文件
  {
    ignores: ['node_modules/', 'dist/', 'unpackage/']
  }
]
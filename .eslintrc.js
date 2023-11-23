module.exports = {
  root: true,
  extends: ['@react-native-community', 'prettier'],
  plugins: ['react', 'react-native', '@typescript-eslint', 'react-hooks', 'import', 'unused-imports'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    'react-native/react-native': true,
  },
  rules: {
    curly: ['warn', 'multi-line'],
    semi: ['error', 'never'],
    'prefer-const': [
      'error',
      {
        destructuring: 'all', // destructuring can be used if *any* of the elements needs to be variable
      },
    ],
    // react-native rules: https://github.com/Intellicode/eslint-plugin-react-native/tree/master/docs/rules
    'react-native/no-inline-styles': 'error',
    'react-native/no-unused-styles': 'error',
    'react-native/no-single-element-style-arrays': 'error',
    // Use the TS version of no-shadow instead https://stackoverflow.com/a/63961972/891135
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': ['error'],
    'unused-imports/no-unused-imports': 'error',
    'unused-imports/no-unused-vars': [
      'warn',
      {vars: 'all', varsIgnorePattern: '^_', args: 'after-used', argsIgnorePattern: '^_'},
    ],
    'react-hooks/rules-of-hooks': 'error', // Checks rules of Hooks
    'react-hooks/exhaustive-deps': 'error', // Checks effect dependencies
    'import/order': ['error'],
    'no-restricted-imports': ['error'],
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'no-undef': 'off', // https://github.com/typescript-eslint/typescript-eslint/blob/master/docs/getting-started/linting/FAQ.md#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
      },
    },
  ],
}

module.exports = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  extends: [
    // https://www.npmjs.com/package/@typescript-eslint/eslint-plugin
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
    'plugin:react/recommended', // Uses the recommended rules from @eslint-plugin-react
  ],
  parserOptions: {
    ecmaFeatures: {
      "jsx": true
    },
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
  },
  plugins: [
    'react'
  ],
  env: {
    browser: true
  },
  rules: {
    'jsx-quotes': [2, 'prefer-single'],
    'react/jsx-curly-spacing': [2, 'always'],
    'react/prefer-stateless-function': 'off',
    'react/no-deprecated': 'off',
    'jsx-a11y/href-no-hash': 'off',
    'no-throw-literal': 'off',
    'operator-assignment': 'off',
    'no-unused-vars': ['error', { 
      'vars': 'all', 'args': 'after-used'
    }],
    'comma-dangle': 'error',
    // 'indent': ['error', 2, {'SwitchCase': 1}],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always'],
    'no-console': 'off',
    'camelcase': 'off',
    'object-curly-spacing': ['error', 'never'],
    'prefer-const': 'off',
    'no-underscore-dangle': 'off',
    'no-param-reassign': 'off',
    'no-plusplus': 'off',
    'no-useless-escape': 'off',
    'no-restricted-properties': 'off',
    'consistent-return': 'off',
    'guard-for-in': 'off',
    'no-loop-func': 'off',
    'curly': ['error', 'all'],
    'brace-style': ['error', '1tbs'],
    'default-case': 'error',
    'prefer-destructuring': 'off',
    'padding-line-between-statements': [
        'error',
        { 'blankLine': 'always', 'prev': '*', 'next': 'block-like' },
        { 'blankLine': 'always', 'prev': 'block-like', 'next': '*' }
    ],
    'max-len': ['error', {'code': 200}],
    'implicit-arrow-linebreak': ['error', 'beside'],
    'no-control-regex': 'off',
    'arrow-parens': ['error', 'always'],
    'indent': 'off',
    // TypeScript specific rules
    '@typescript-eslint/indent': ['error', 2, {'SwitchCase': 1}],
    "@typescript-eslint/explicit-function-return-type": 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off'
  },
  settings: {
    react: {
      version: 'detect', // Tells eslint-plugin-react to automatically detect the version of React to use
    },
    'import/resolver': 'webpack'
  }
}
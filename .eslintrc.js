module.exports = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  plugins: ["prettier", "@typescript-eslint"],
  extends: [
    // "airbnb",
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
  ],
  env: {
    "browser": true,
    "node": true,
    "es6": true,
    "mocha": true
  },
  parserOptions: {
    ecmaFeatures: {
      "jsx": true
    },
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
  },
  rules: {
    "no-unused-vars": [
      "error", {
        "vars": "all",
        "args": "after-used"
      }
    ],
    "comma-dangle": "off",
    "indent": [
      "error",
      2, {
        "SwitchCase": 1
      }
    ],
    "quotes": [
      "error", "single"
    ],
    "semi": [
      "error", "always"
    ],
    "no-console": "off",
    "camelcase": "off",
    "object-curly-spacing": [
      "error", "never"
    ],
    "prefer-const": "off",
    "no-underscore-dangle": "off",
    "no-param-reassign": "off",
    "no-plusplus": "off",
    "no-useless-escape": "off",
    "no-restricted-properties": "off",
    "consistent-return": "off",
    "guard-for-in": "off",
    "no-loop-func": "off",
    "curly": [
      "error", "all"
    ],
    "brace-style": [
      "error", "1tbs"
    ],
    "default-case": "off",
    "prefer-destructuring": "off",
    "padding-line-between-statements": [
      "error", {
        "blankLine": "always",
        "prev": "*",
        "next": "block-like"
      }, {
        "blankLine": "always",
        "prev": "block-like",
        "next": "*"
      }
    ],
    "arrow-parens": [
      "error", "always"
    ],
    "max-len": [
      "error", {
        "code": 100
      }
    ],
    "implicit-arrow-linebreak": [
      "error", "beside"
    ],
    // TypeScript specific rules
    '@typescript-eslint/indent': [
      'error',
      2, {
        'SwitchCase': 1
      }
    ],
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-member-accessibility": "off"
  }
}

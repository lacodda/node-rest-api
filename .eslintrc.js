// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  env: {
    node: true,
    mocha: true,
  },
  parserOptions: {
    ecmaVersion: 8,
  },
  extends: ['airbnb-base'],
  rules: {
    'arrow-parens': ['error', 'as-needed'],
    // maximum length of string
    'max-len': [
      1,
      120,
      2,
      {
        ignoreComments: true,
      },
    ],
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'never',
      },
    ],
    indent: 'off',
    'no-underscore-dangle': 0,
    'no-unused-vars': ['error', { argsIgnorePattern: 'next' }],
    'no-use-before-define': ['error', { variables: false }],
    'no-multi-str': 0,
  },
};

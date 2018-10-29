module.exports = {
  extends: 'airbnb-base',
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: 'WithStatement',
        message:
          '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
      },
    ],
    'no-console': 'off',
    'no-bitwise': 'off',
    'no-plusplus': 'off',
    'no-underscore-dangle': 'off',
    'no-unused-expressions': ['error', { allowShortCircuit: true }],
    'no-continue': 'off',
  },
};

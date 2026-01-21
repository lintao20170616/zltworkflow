// .eslintrc.js
// 支持.js文件
module.exports = {
  extends: ['eslint:recommended'],
  rules: {
    // 即将被eslint去除的规则
    'no-extra-semi': 0,
  },
  env: { node: true, browser: true, es6: true },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      globalReturn: true,
      jsx: true,
    },
  },
  reportUnusedDisableDirectives: true,
  globals: {
    $t: 'readonly',
  },
};

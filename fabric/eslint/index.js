const jsEslintConfig = require('./js');
const vue2EslintConfig = require('./vue2');
const vue3EslintConfig = require('./vue3');
const htmlEslintConfig = require('./html');
const eggEslintConfig = require('./egg');

// .eslintrc.js
module.exports = {
  ...jsEslintConfig,

  overrides: [
    {
      files: ['client/spa/**/*.vue', 'client/spa/**/*.ts'],
      ...vue3EslintConfig,
    },
    {
      files: ['client/spa/**/*.js'],
      ...vue2EslintConfig,
    },

    ...htmlEslintConfig.overrides, // 必须放在vue下面

    ...eggEslintConfig.overrides,

    {
      extends: ['prettier'], // 关闭和prettier可能冲突的配置
      files: ['*'],
      parserOptions: {
        sourceType: 'module',
      },
      rules: {
        // 对对象原型方法的检查
        'no-prototype-builtins': 1,
        // 强制检查未使用的变量
        'no-unused-vars': 1,
        // 如果一个变量永远不会被重新赋值，那么使用const声明
        'prefer-const': 1,
        // 建议使用 let 或 const 而不是 var
        'no-var': 0,
        // 禁止空的块级作用域
        'no-empty': 0,
        // 不必要的\
        'no-useless-escape': 1,
        // new Promise的参数不允许是async方法
        'no-async-promise-executor': 1,
        // 禁止条件中的常量表达式
        'no-constant-condition': 1,
      },
    },
  ],
};

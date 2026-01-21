// .eslintrc.js
// 支持：.vue文件的<template>和<script>、.js文件的vue代码
module.exports = {
  extends: ['plugin:vue/recommended'],
  rules: {
    // 对不可变属性的检查
    'vue/no-mutating-props': [2, { shallowOnly: true }],
    // 模板中引用组件名用短横线法（而不是驼峰法）
    'vue/component-name-in-template-casing': [1, 'kebab-case', { registeredComponentsOnly: false }],
    // 禁止使用v-html以防止XSS攻击
    'vue/no-v-html': 1,
    // 要求组件名称始终为多字
    'vue/multi-word-component-names': 0,
    // 需要 props 默认值
    'vue/require-default-prop': 1,
    // 禁止计算属性中的异步操作
    'vue/no-async-in-computed-properties': 1,
    // 单文件组件中是否存在未使用的组件
    'vue/no-unused-components': 1,

    // 对 Vue 属性换行的检查
    'vue/max-attributes-per-line': 0,
    // 在单行元素的内容之前和之后换行
    'vue/singleline-html-element-content-newline': 0,
    // 强制元素自闭标签
    'vue/html-self-closing': 0,
    // 对 HTML 缩进的检查
    'vue/html-indent': 0,

    // 即将被eslint去除的规则
    'space-before-function-paren': 0,
    'space-in-parens': 0,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    ecmaFeatures: {
      jsx: true,
    },
  },
};

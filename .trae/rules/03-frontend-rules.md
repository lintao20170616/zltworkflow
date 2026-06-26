---
alwaysApply: false
description: '前端开发规则，修改前端代码(client/spa/)时必须遵守'
---

# 前端开发规则

## 架构约束

- 必须使用 Vue 3 Composition API (`<script setup>`)
- 组件必须有且只有一个根元素
- Props 必须使用 `defineProps` + `withDefaults`
- 事件必须使用 `defineEmits` 定义

## 命名规范

- 页面文件: 小写 `xxx.vue`
- 组件文件: 大驼峰 `Xxx.vue`
- Service 文件: 小写 `xxx.ts`
- Store 文件: 小写 `xxx.ts`，方法名 `useXxxStore`
- 变量名: 小驼峰 `userName`
- 布尔变量: `isLoggedIn`, `hasPermission`
- 事件处理: `handleClick`, `handleSubmit`

## 代码规范

- 模板缩进 2 空格，属性顺序: id → class → props → events → directives
- 列表渲染必须加 `:key`
- 禁止在同一元素同时使用 `v-if` 和 `v-for`
- 样式必须使用 `<style scoped>`
- 样式命名使用 BEM 规范 `block__element--modifier`
- 路由使用懒加载 `() => import()`
- 组件使用按需导入

## Store 规范

- 使用 Pinia `defineStore`
- 状态在 `state` 定义
- 计算属性在 `getters` 定义
- 状态变更在 `actions` 定义
- 异步操作在 `actions` 中处理

## Service 规范

- API 封装统一导出对象
- 请求前缀 `/api`
- 超时时间 600 秒
- 类型定义使用 TypeScript 接口

## 国际化规范

- 使用 `vue-i18n`
- 语言文件在 `i18n/locales/`
- 模板中使用 `t('key')`
- 脚本中使用 `useI18n().t()`

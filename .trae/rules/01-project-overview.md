---
alwaysApply: true
description: '项目概览和核心约定，所有开发任务必须遵守'
---

# 项目概览

## 技术栈
- 后端: Egg.js 3.32.0 + Sequelize 6.37.1 + MySQL + Redis
- 前端: Vue 3.5.26 + TypeScript + Vite + Element Plus + Pinia
- AI: Ollama (本地LLM)

## 目录结构
- `app/`: 后端应用
- `client/spa/apps/default/`: 前端应用
- `config/`: 配置文件
- `database/migrations/`: 数据库迁移脚本
- `doc/`: 项目文档
- `openspec/`: OpenSpec规范

## 核心约定
- 所有代码必须通过 ESLint/Prettier/Stylelint 检查
- 提交信息格式: `类型: 描述`，类型包括 feat/fix/docs/style/refactor/test/chore
- 分支命名: feature/功能名 | fix/问题描述
- 每次回复必须叫"领导"

## 关键文档
- AI开发指南: doc/AI开发指南.md
- 业务逻辑详解: doc/业务逻辑详解.md
- 后端开发规范: doc/后端开发规范.md
- 前端开发规范: doc/前端开发规范.md
- 数据模型文档: doc/数据模型文档.md
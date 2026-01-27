# Change: 添加翻译平台核心功能

## Why
当前系统已具备语言管理模块，可以管理多语言配置。为了构建翻译平台，需要实现翻译项目管理、翻译内容管理和翻译任务管理等核心功能，支持多语言内容的翻译和管理。

## What Changes
- **新增翻译项目管理功能**
  - 创建、编辑、删除翻译项目
  - 项目与语言关联配置
  - 项目状态管理（进行中、已完成、已归档）

- **新增翻译内容管理功能**
  - 翻译键值对（key-value）管理
  - 支持多语言翻译内容存储
  - 在项目详情页中按目标语言 Tab 组织翻译内容
  - 每个语言 Tab 下显示该语言的翻译列表

- **新增翻译任务管理功能**
  - 翻译任务创建和分配
  - 任务状态跟踪（待翻译、翻译中、待审核、已完成）
  - 翻译进度统计

## Impact
- **受影响的规范**：
  - 新增 `translation-platform` 功能规范
  - 可能需要扩展 `language` 功能规范（关联翻译内容）

- **受影响的代码**：
  - 后端：新增 `app/model/translation*.js`、`app/service/translation*.js`、`app/controller/translation*.js`
  - 前端：新增 `client/spa/apps/default/views/translation/` 相关页面
    - 项目管理列表页
    - 项目翻译详情页（包含多语言 Tab 切换）
  - 数据库：新增 `translations`、`translation_projects`、`translation_tasks` 表
  - 路由：新增 `/api/translation/*` 相关路由
  - 前端路由：`/translation/projects`（列表）、`/translation/projects/:id`（详情）

- **数据模型扩展**：
  - `languages` 表已存在，需要建立与翻译内容的关联
  - 新增翻译相关表结构

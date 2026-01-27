## 1. 数据库设计与迁移
- [ ] 1.1 设计翻译项目表（translation_projects）
  - [ ] 字段：id, name, description, source_language_id, target_language_ids, status, created_by, created_at, updated_at
  - [ ] 创建迁移脚本 `005_create_translation_tables.sql`
- [ ] 1.2 设计翻译内容表（translations）
  - [ ] 字段：id, project_id, key, source_text, language_id, translated_text, status, translator_id, reviewer_id, created_at, updated_at
  - [ ] 建立与 languages 表的关联
- [ ] 1.3 设计翻译任务表（translation_tasks）
  - [ ] 字段：id, project_id, translator_id, reviewer_id, status, progress, due_date, created_at, updated_at
  - [ ] 任务状态枚举：pending, in_progress, review, completed, cancelled

## 2. 后端模型层
- [ ] 2.1 创建 TranslationProject 模型
  - [ ] 定义字段和关联关系
  - [ ] 添加验证规则
- [ ] 2.2 创建 Translation 模型
  - [ ] 定义字段和关联关系（project, language）
  - [ ] 添加唯一性约束（project_id + key + language_id）
- [ ] 2.3 创建 TranslationTask 模型
  - [ ] 定义字段和关联关系
  - [ ] 添加状态枚举

## 3. 后端服务层
- [ ] 3.1 创建 TranslationProjectService
  - [ ] 实现项目 CRUD 操作
  - [ ] 实现项目状态管理
  - [ ] 实现项目语言配置
- [ ] 3.2 创建 TranslationService
  - [ ] 实现翻译内容 CRUD 操作
  - [ ] 实现按项目和语言查询翻译内容列表
  - [ ] 实现批量导入/导出（支持按项目和语言筛选）
  - [ ] 实现翻译内容搜索和筛选（支持在指定项目和语言范围内）
- [ ] 3.3 创建 TranslationTaskService
  - [ ] 实现任务创建和分配
  - [ ] 实现任务状态更新
  - [ ] 实现任务进度统计

## 4. 后端控制器层
- [ ] 4.1 创建 TranslationProjectController
  - [ ] 实现项目列表、创建、更新、删除接口
  - [ ] 实现项目状态更新接口
- [ ] 4.2 创建 TranslationController
  - [ ] 实现翻译内容列表接口（支持 project_id 和 language_id 查询参数）
  - [ ] 实现翻译内容创建、更新、删除接口
  - [ ] 实现批量导入/导出接口（支持指定项目和语言）
  - [ ] 实现搜索和筛选接口（在指定项目和语言范围内）
- [ ] 4.3 创建 TranslationTaskController
  - [ ] 实现任务列表、创建、更新接口
  - [ ] 实现任务分配和状态更新接口
  - [ ] 实现任务统计接口

## 5. 路由配置
- [ ] 5.1 添加翻译项目路由
  - [ ] GET /api/translation/projects - 项目列表
  - [ ] POST /api/translation/projects - 创建项目
  - [ ] PUT /api/translation/projects/:id - 更新项目
  - [ ] DELETE /api/translation/projects/:id - 删除项目
  - [ ] GET /api/translation/projects/:id - 获取项目详情（包含目标语言列表）
- [ ] 5.2 添加翻译内容路由
  - [ ] GET /api/translation/contents - 翻译内容列表（支持 project_id 和 language_id 筛选）
  - [ ] POST /api/translation/contents - 创建翻译内容
  - [ ] PUT /api/translation/contents/:id - 更新翻译内容
  - [ ] DELETE /api/translation/contents/:id - 删除翻译内容
  - [ ] POST /api/translation/contents/import - 批量导入（支持指定项目）
  - [ ] GET /api/translation/contents/export - 批量导出（支持指定项目和语言）
- [ ] 5.3 添加翻译任务路由
  - [ ] GET /api/translation/tasks - 任务列表
  - [ ] POST /api/translation/tasks - 创建任务
  - [ ] PUT /api/translation/tasks/:id - 更新任务
  - [ ] PATCH /api/translation/tasks/:id/status - 更新任务状态

## 6. 前端 API 服务
- [ ] 6.1 创建 translation.ts 服务文件
  - [ ] 定义 TypeScript 接口类型（项目、翻译内容、任务等）
  - [ ] 实现项目相关 API 调用（列表、详情、CRUD）
  - [ ] 实现翻译内容相关 API 调用（支持 project_id 和 language_id 参数）
  - [ ] 实现任务相关 API 调用

## 7. 前端页面开发
- [ ] 7.1 创建项目管理列表页面
  - [ ] 项目列表展示（表格形式）
  - [ ] 项目创建/编辑对话框
  - [ ] 项目状态管理
  - [ ] 项目语言配置
  - [ ] 每个项目行添加"进入详情"操作按钮
- [ ] 7.2 创建项目翻译详情页面
  - [ ] 显示项目基本信息（名称、描述、状态等）
  - [ ] 根据项目的目标语言动态生成 Tab（使用 Element Plus 的 el-tabs）
  - [ ] 每个 Tab 显示对应语言的名称（从 languages 表获取）
  - [ ] 当前 Tab 下显示该项目的该语言翻译列表
  - [ ] 支持在当前 Tab 内搜索翻译键和翻译文本
  - [ ] 支持在当前 Tab 内创建、编辑、删除翻译内容
  - [ ] 支持批量导入/导出（按当前项目和语言）
  - [ ] 切换 Tab 时重新加载对应语言的翻译列表
- [ ] 7.3 创建翻译任务页面
  - [ ] 任务列表展示
  - [ ] 任务创建和分配
  - [ ] 任务状态更新
  - [ ] 任务进度统计

## 8. 前端路由配置
- [ ] 8.1 添加翻译平台路由
  - [ ] /translation/projects - 项目管理列表
  - [ ] /translation/projects/:id - 项目翻译详情页（包含多语言 Tab）
  - [ ] /translation/tasks - 任务管理

## 9. 测试与优化
- [ ] 9.1 后端接口测试
  - [ ] 测试所有 CRUD 操作
  - [ ] 测试批量导入/导出
- [ ] 9.2 前端功能测试
  - [ ] 测试页面交互
  - [ ] 测试数据展示
  - [ ] 测试表单验证
- [ ] 9.3 性能优化
  - [ ] 优化数据库查询
  - [ ] 添加缓存机制
  - [ ] 优化批量操作性能

## 1. 数据库设计与迁移

- [x] 1.1 扩展翻译任务表（translation_tasks）
  - [x] 新增字段：`task_number` VARCHAR(50) NOT NULL UNIQUE COMMENT '任务编号'
  - [x] 新增字段：`project_name` VARCHAR(255) NOT NULL COMMENT '项目名称'
  - [x] 新增字段：`text_count` INT(11) NOT NULL DEFAULT 0 COMMENT '文案条数'
  - [x] 新增字段：`is_backfilled` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否回填：0-否，1-是'
  - [x] 创建迁移脚本 `006_extend_translation_tables.sql`
  - [x] 为现有任务生成任务编号（如果存在）

- [x] 1.2 扩展翻译内容表（translations）
  - [x] 新增字段：`task_id` INT(11) UNSIGNED DEFAULT NULL COMMENT '翻译任务ID（关联translation_tasks表）'
  - [x] 添加外键约束：`fk_translations_task` FOREIGN KEY (`task_id`) REFERENCES `translation_tasks` (`id`) ON DELETE SET NULL
  - [x] 添加索引：`idx_task_id` (`task_id`)
  - [x] 在迁移脚本中更新

## 2. 后端模型层

- [x] 2.1 更新 TranslationTask 模型（`app/model/translationTask.js`）
  - [x] 添加新字段定义：taskNumber、projectName、textCount、isBackfilled
  - [x] 更新关联关系（与 Translation 的一对多关系）

- [x] 2.2 更新 Translation 模型（`app/model/translation.js`）
  - [x] 添加 taskId 字段定义
  - [x] 添加与 TranslationTask 的关联关系（belongsTo）

## 3. 后端服务层

- [x] 3.1 扩展 TranslationService（`app/service/translation.js`）
  - [x] 添加方法 `pushDefaultJson(projectId, defaultJsonPath, defaultJsonData)`
    - **步骤1**：首先创建翻译任务
      - 获取项目信息（通过 projectId）
      - 生成唯一任务编号（调用 TranslationTaskService.generateTaskNumber()）
      - 创建翻译任务记录（project_id、project_name、status=1、is_backfilled=0、text_count=0）
    - **步骤2**：读取并解析 default.json 数据
      - 优先使用请求体中的 `defaultJsonData`（脚本调用）
      - 否则从 `defaultJsonPath` 文件路径读取（兼容旧方式）
      - 解析 JSON 数据（格式：`{ "uuid": "中文文案" }`）
    - **步骤3**：获取项目的目标语言列表
      - 从项目信息中获取 `targetLanguageIds`（JSON数组）
    - **步骤4**：为每个 UUID 在每个目标语言下创建翻译记录
      - 遍历 default.json 中的每个 UUID
      - 遍历项目的每个目标语言 ID
      - 检查是否已存在（project_id + key + language_id 唯一性）
      - 如果不存在，创建翻译记录：
        - key: UUID
        - project_id: 提供的项目 ID
        - source_text: 中文文案
        - language_id: 目标语言 ID
        - translated_text: 空（默认为空，等待后续翻译）
        - status: 1（待翻译）
        - task_id: 步骤1创建的翻译任务ID
    - **步骤5**：更新翻译任务的文案条数
      - 统计实际创建的翻译记录总数
      - 更新翻译任务的 `text_count` 字段
    - **步骤6**：返回推送结果
      - 返回统计信息（成功数、失败数、错误信息）
      - 返回任务ID和任务编号

- [x] 3.2 扩展 TranslationTaskService（`app/service/translationTask.js`）
  - [x] 添加方法 `generateTaskNumber()` - 生成唯一任务编号
  - [x] 添加方法 `list(query)` - 查询任务列表（支持筛选和排序）
  - [x] 添加方法 `getDetail(taskId)` - 获取任务详情（包含关联的翻译记录）
  - [x] 添加方法 `updateStatus(taskId, status)` - 更新任务状态
  - [x] 添加方法 `backfill(taskId)` - 回填翻译结果到语言文件
    - [x] 获取任务关联的所有已完成的翻译记录
    - [x] 按语言分组，更新对应的语言文件（如 en-US.json）
    - [x] 更新任务的 is_backfilled 字段
  - [x] 添加方法 `delete(id)` - 删除任务

## 4. 后端控制器层

- [x] 4.1 扩展 TranslationController（`app/controller/translation.js`）
  - [x] 添加推送接口（POST `/api/translation/push-default-json`）
    - [x] 接收参数：
      - projectId（必填，INTEGER）- 翻译项目ID
      - defaultJsonPath（可选，STRING）- default.json 文件路径，默认为 `client/spa/apps/default/i18n/locales/default.json`
    - [x] 参数验证：确保 projectId 存在且有效
    - [x] 调用服务层方法 `pushDefaultJson(projectId, defaultJsonPath)` 推送数据
    - [x] 返回推送结果（包含成功数、失败数、错误信息、任务ID、任务编号）

- [x] 4.2 扩展 TranslationTaskController（`app/controller/translationTask.js`）
  - [x] 添加任务列表接口（GET `/api/translation/tasks`）
    - [x] 支持查询参数：taskNumber、projectName、status、isBackfilled
    - [x] 支持分页和排序
  - [x] 添加任务详情接口（GET `/api/translation/tasks/:id`）
    - [x] 返回任务信息和关联的翻译记录列表
  - [x] 添加创建任务接口（POST `/api/translation/tasks`）
    - [x] 接收参数：projectId、translatorId、reviewerId 等
    - [x] 自动生成任务编号
  - [x] 添加更新任务接口（PUT `/api/translation/tasks/:id`）
    - [x] 支持更新任务状态、翻译人员、审核人员等
  - [x] 添加回填接口（POST `/api/translation/tasks/:id/backfill`）
    - [x] 执行回填操作
    - [x] 返回回填结果
  - [x] 添加删除接口（DELETE `/api/translation/tasks/:id`）

- [x] 4.3 添加路由配置（`app/router.js`）
  - [x] 添加推送接口路由
  - [x] 添加任务管理相关路由

## 5. 前端实现

- [x] 5.1 扩展翻译服务（`client/spa/apps/default/service/translation.ts`）
  - [x] 添加推送 default.json 的 API 方法
  - [x] 添加翻译任务相关的 API 方法（列表、详情、创建、更新、回填、删除）

- [x] 5.2 创建翻译任务列表页面（`client/spa/apps/default/views/translation/tasks/index.vue`）
  - [x] 实现任务列表展示（表格形式）
  - [x] 实现筛选功能（任务编号、项目名称、状态、是否回填）
  - [x] 实现排序功能
  - [x] 实现创建任务按钮
  - [x] 实现查看详情、编辑、删除操作

- [x] 5.3 创建翻译任务详情页面（`client/spa/apps/default/views/translation/tasks/detail.vue`）
  - [x] 显示任务基本信息（任务编号、项目名称、文案条数、状态、是否回填等）
  - [x] 显示任务关联的翻译记录列表
  - [x] 显示任务进度统计
  - [x] 实现回填按钮和操作

- [x] 5.4 添加前端路由（`client/spa/apps/default/router/index.ts`）
  - [x] 添加 `/translation/tasks` 路由（任务列表）
  - [x] 添加 `/translation/tasks/:id` 路由（任务详情）

- [x] 5.5 创建推送脚本（`scripts/i18n-push.js`）
  - [x] 使用 `commander` 进行命令行参数解析（参考 `scripts/index.js` 的技术栈）
  - [x] 使用 `axios` 发送 HTTP 请求
  - [x] 支持命令行参数：`--project-id`、`--file`、`--api-url`
  - [x] 支持环境变量配置：`PROJECT_ID`、`API_BASE_URL`
  - [x] 实现 CSRF token 获取功能（通过访问接口获取 cookie）
  - [x] 读取 default.json 文件
  - [x] 调用推送接口（POST `/api/translation/push-default-json`）
  - [x] 显示推送结果
  - [x] 添加 npm 脚本：`npm run i18n:push`
  - [x] 配置更新：将推送接口添加到 OAuth 和 CSRF 白名单（`config/config.default.js`）

## 6. 测试

- [x] 6.1 测试扫描功能（已完成）
  - [x] 测试扫描 .vue 文件中的 $t 函数
  - [x] 测试扫描 .ts/.js 文件中的 $t 函数
  - [x] 测试提取中文文案并生成 UUID
  - [x] 测试生成 default.json 文件

- [ ] 6.2 测试推送功能
  - [ ] 测试读取 default.json 文件
  - [ ] 测试推送 UUID 和中文文案到翻译项目
  - [ ] 测试为源语言和目标语言创建翻译记录
  - [ ] 测试自动创建翻译任务并关联翻译记录
  - [ ] 测试重复 UUID 的处理逻辑（跳过已存在的记录）
  - [ ] 测试推送结果统计

- [ ] 6.3 测试翻译任务功能
  - [ ] 测试任务列表查询和筛选
  - [ ] 测试任务详情查看
  - [ ] 测试任务创建和任务编号生成
  - [ ] 测试任务状态更新
  - [ ] 测试回填功能（将翻译结果回填到语言文件）

## 1. 数据库设计与迁移

- [ ] 1.1 扩展翻译任务表（translation_tasks）
  - [ ] 新增字段：`task_number` VARCHAR(50) NOT NULL UNIQUE COMMENT '任务编号'
  - [ ] 新增字段：`project_name` VARCHAR(255) NOT NULL COMMENT '项目名称'
  - [ ] 新增字段：`text_count` INT(11) NOT NULL DEFAULT 0 COMMENT '文案条数'
  - [ ] 新增字段：`is_backfilled` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否回填：0-否，1-是'
  - [ ] 创建迁移脚本 `006_extend_translation_tables.sql`
  - [ ] 为现有任务生成任务编号（如果存在）

- [ ] 1.2 扩展翻译内容表（translations）
  - [ ] 新增字段：`task_id` INT(11) UNSIGNED DEFAULT NULL COMMENT '翻译任务ID（关联translation_tasks表）'
  - [ ] 添加外键约束：`fk_translations_task` FOREIGN KEY (`task_id`) REFERENCES `translation_tasks` (`id`) ON DELETE SET NULL
  - [ ] 添加索引：`idx_task_id` (`task_id`)
  - [ ] 在迁移脚本中更新

## 2. 后端模型层

- [ ] 2.1 更新 TranslationTask 模型（`app/model/translationTask.js`）
  - [ ] 添加新字段定义：taskNumber、projectName、textCount、isBackfilled
  - [ ] 更新关联关系（与 Translation 的一对多关系）

- [ ] 2.2 更新 Translation 模型（`app/model/translation.js`）
  - [ ] 添加 taskId 字段定义
  - [ ] 添加与 TranslationTask 的关联关系（belongsTo）

## 3. 后端服务层

- [ ] 3.1 扩展 TranslationService（`app/service/translation.js`）
  - [ ] 添加方法 `pushDefaultJson(projectId, defaultJsonPath)`
    - **步骤1**：首先创建翻译任务
      - 获取项目信息（通过 projectId）
      - 生成唯一任务编号（调用 TranslationTaskService.generateTaskNumber()）
      - 创建翻译任务记录（project_id、project_name、status=1、is_backfilled=0、text_count=0）
    - **步骤2**：读取并解析 default.json 文件
      - 读取本地 default.json 文件（默认路径：`client/spa/apps/default/i18n/locales/default.json`）
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

- [ ] 3.2 扩展 TranslationTaskService（`app/service/translationTask.js`）
  - [ ] 添加方法 `generateTaskNumber()` - 生成唯一任务编号
  - [ ] 添加方法 `list(query)` - 查询任务列表（支持筛选和排序）
  - [ ] 添加方法 `getDetail(taskId)` - 获取任务详情（包含关联的翻译记录）
  - [ ] 添加方法 `updateStatus(taskId, status)` - 更新任务状态
  - [ ] 添加方法 `backfill(taskId)` - 回填翻译结果到语言文件
    - 获取任务关联的所有已完成的翻译记录
    - 按语言分组，更新对应的语言文件（如 en-US.json）
    - 更新任务的 is_backfilled 字段

## 4. 后端控制器层

- [ ] 4.1 扩展 TranslationController（`app/controller/translation.js`）
  - [ ] 添加推送接口（POST `/api/translation/push-default-json`）
    - 接收参数：
      - projectId（必填，INTEGER）- 翻译项目ID
      - defaultJsonPath（可选，STRING）- default.json 文件路径，默认为 `client/spa/apps/default/i18n/locales/default.json`
    - 参数验证：确保 projectId 存在且有效
    - 调用服务层方法 `pushDefaultJson(projectId, defaultJsonPath)` 推送数据
    - 返回推送结果（包含成功数、失败数、错误信息、任务ID、任务编号）

- [ ] 4.2 扩展 TranslationTaskController（`app/controller/translationTask.js`）
  - [ ] 添加任务列表接口（GET `/api/translation/tasks`）
    - 支持查询参数：taskNumber、projectName、status、isBackfilled
    - 支持分页和排序
  - [ ] 添加任务详情接口（GET `/api/translation/tasks/:id`）
    - 返回任务信息和关联的翻译记录列表
  - [ ] 添加创建任务接口（POST `/api/translation/tasks`）
    - 接收参数：projectId、translatorId、reviewerId 等
    - 自动生成任务编号
  - [ ] 添加更新任务接口（PUT `/api/translation/tasks/:id`）
    - 支持更新任务状态、翻译人员、审核人员等
  - [ ] 添加回填接口（POST `/api/translation/tasks/:id/backfill`）
    - 执行回填操作
    - 返回回填结果

- [ ] 4.3 添加路由配置（`app/router.js`）
  - [ ] 添加推送接口路由
  - [ ] 添加任务管理相关路由

## 5. 前端实现

- [ ] 5.1 扩展翻译服务（`client/spa/apps/default/service/translation.ts`）
  - [ ] 添加推送 default.json 的 API 方法
  - [ ] 添加翻译任务相关的 API 方法（列表、详情、创建、更新、回填）

- [ ] 5.2 创建翻译任务列表页面（`client/spa/apps/default/views/translation/tasks/index.vue`）
  - [ ] 实现任务列表展示（表格形式）
  - [ ] 实现筛选功能（任务编号、项目名称、状态、是否回填）
  - [ ] 实现排序功能
  - [ ] 实现分页功能
  - [ ] 实现创建任务按钮
  - [ ] 实现查看详情、编辑、删除操作

- [ ] 5.3 创建翻译任务详情页面（`client/spa/apps/default/views/translation/tasks/detail.vue`）
  - [ ] 显示任务基本信息（任务编号、项目名称、文案条数、状态、是否回填等）
  - [ ] 显示任务关联的翻译记录列表
  - [ ] 显示任务进度统计
  - [ ] 实现状态更新功能
  - [ ] 实现回填按钮和操作

- [ ] 5.4 添加前端路由（`client/spa/apps/default/router/index.ts`）
  - [ ] 添加 `/translation/tasks` 路由（任务列表）
  - [ ] 添加 `/translation/tasks/:id` 路由（任务详情）

- [ ] 5.5 在翻译项目详情页添加"推送 default.json"按钮
  - [ ] 调用推送接口
  - [ ] 显示推送结果和创建的任务信息

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

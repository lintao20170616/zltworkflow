# Change: 添加 i18n 扫描工具

## Why

当前前端代码中存在大量硬编码的中文文本，缺乏国际化支持。为了支持多语言，需要提供工具自动扫描代码中的文本，提取需要翻译的内容，并生成标准的多语言本地化文件（local files）。这样可以：

- 自动化提取需要翻译的文本，减少手动工作
- 生成标准格式的多语言文件，便于与翻译平台集成
- 支持增量扫描，只提取新增或修改的文本
- 提供与现有翻译平台的集成能力

## What Changes

- **i18n 扫描工具（已完成）**
  - ✅ 扫描项目路径下的 .vue、.ts、.js 文件
  - ✅ 提取 i18n 的 $t() 函数中使用的翻译键（支持中文作为键）
  - ✅ 生成 default.json 文件（格式：`{ "uuid": "中文文案" }`）
  - ✅ 扫描脚本：`scripts/i18n-scanner.js`，可通过 `npm run i18n:scan` 执行

- **推送 default.json 到翻译平台（待实现）**
  - **接口要求**：必须提供项目 ID（projectId）作为必填参数
  - **执行流程**：
    1. 首先创建一个翻译任务（自动生成任务编号、设置项目名称、初始状态为"待翻译"）
    2. 读取本地 `client/spa/apps/default/i18n/locales/default.json` 文件
    3. 解析 JSON 数据（格式：`{ "uuid": "中文文案" }`）
    4. 获取项目的 `targetLanguageIds`（目标语言ID列表）
    5. 为每个 UUID 在每个目标语言下创建翻译记录：
       - key: UUID
       - sourceText: 中文文案
       - languageId: 目标语言 ID（从 targetLanguageIds 中获取）
       - translatedText: 空（在没有机器自动翻译的情况下默认为空）
       - status: 1（待翻译）
       - taskId: 关联到步骤1创建的翻译任务ID
    6. 更新翻译任务的 `text_count` 字段（等于创建的翻译记录总数）
    7. 如果翻译键（UUID）已存在，则跳过（不重复创建）
    8. 返回推送结果统计（成功数、失败数、错误信息、任务ID）

- **翻译任务模块（待实现）**
  - **后端：扩展翻译任务表**
    - 新增字段：`task_number`（任务编号，唯一标识）
    - 新增字段：`project_name`（项目名称，冗余存储便于查询）
    - 新增字段：`text_count`（文案条数，任务包含的翻译记录数量）
    - 新增字段：`is_backfilled`（是否回填，TINYINT，0-否，1-是）
    - 保留现有字段：`status`（状态）、`project_id`、`translator_id`、`reviewer_id` 等
  - **后端：扩展 Translation 表**
    - 新增字段：`task_id`（关联翻译任务ID，可为空）
    - 建立与 `translation_tasks` 表的关联关系
  - **前端：新增翻译任务管理模块**
    - 翻译任务列表页面（显示任务编号、项目名称、文案条数、状态、是否回填等）
    - 翻译任务详情页面（显示任务关联的翻译记录）
    - 支持按任务编号、项目名称、状态等条件筛选
    - 支持创建、编辑、删除翻译任务
    - 支持任务状态管理（待翻译、翻译中、待审核、已完成、已取消）
    - 支持回填操作（将翻译结果回填到本地 default.json 或语言文件）

## Impact

- **受影响的规范**：
  - 新增 `i18n-scanner` 功能规范
  - 扩展 `translation-platform` 功能规范（支持导入扫描结果）
- **受影响的代码**：
  - ✅ 已完成：`scripts/i18n-scanner.js`（扫描脚本）
  - ✅ 已完成：`client/spa/apps/default/i18n/index.ts`（自定义 $t 方法）
  - 待实现：数据库迁移脚本（扩展 translation_tasks 和 translations 表）
  - 待实现：后端扩展 `app/model/translationTask.js`（新增字段）
  - 待实现：后端扩展 `app/model/translation.js`（新增 task_id 字段）
  - 待实现：后端扩展 `app/service/translation.js`（添加推送 default.json 的方法）
  - 待实现：后端扩展 `app/service/translationTask.js`（添加任务管理方法）
  - 待实现：后端扩展 `app/controller/translation.js`（添加推送接口）
  - 待实现：后端扩展 `app/controller/translationTask.js`（添加任务管理接口）
  - 待实现：前端新增 `client/spa/apps/default/views/translation/tasks/` 目录和相关页面
  - 待实现：前端扩展 `client/spa/apps/default/service/translation.ts`（添加任务相关 API）
  - 待实现：路由：新增 `/api/translation/push-default-json` 接口
  - 待实现：路由：新增 `/api/translation/tasks/*` 相关路由


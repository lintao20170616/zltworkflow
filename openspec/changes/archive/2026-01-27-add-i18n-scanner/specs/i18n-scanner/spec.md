## ADDED Requirements

### Requirement: 扫描 i18n $t 函数（已完成）
系统 SHALL 提供代码扫描功能，自动扫描指定路径下的代码文件，提取 i18n 的 $t 函数中使用的翻译键。

#### Scenario: 扫描项目路径中的 $t 函数
- **WHEN** 用户运行扫描脚本 `npm run i18n:scan`
- **THEN** 系统扫描 `client/spa/apps/default` 路径下的 .vue、.ts、.js 文件
- **AND** 提取所有 $t() 函数调用中的中文文案（如 `$t('你好')`、`t('你好')`）
- **AND** 为每个唯一的中文文案生成 UUID
- **AND** 生成 default.json 文件，格式为：`{ "uuid": "中文文案" }`

### Requirement: 推送 default.json 到翻译平台（已完成）
系统 SHALL 支持将本地的 default.json 文件推送到翻译平台，自动创建翻译内容并生成翻译任务。

#### Scenario: 推送 default.json 到翻译项目（已完成）
- **WHEN** 用户提供翻译项目 ID（projectId，必填）并调用推送接口
- **THEN** ✅ 系统首先创建一个翻译任务：
  - ✅ task_number: 自动生成唯一任务编号
  - ✅ project_id: 提供的项目 ID
  - ✅ project_name: 从项目信息中获取项目名称
  - ✅ text_count: 初始为 0，后续更新为实际创建的翻译记录总数
  - ✅ status: 1（待翻译）
  - ✅ is_backfilled: 0（未回填）
- **AND** ✅ 系统读取 default.json 数据（支持从请求体接收或从文件路径读取）
- **AND** ✅ 系统解析 JSON 数据（格式：`{ "uuid": "中文文案" }`）
- **AND** ✅ 系统获取项目的 `targetLanguageIds`（目标语言ID列表，JSON数组）
- **AND** ✅ 为每个 UUID 在每个目标语言下创建翻译记录：
  - ✅ key: UUID
  - ✅ project_id: 提供的项目 ID
  - ✅ sourceText: 中文文案
  - ✅ languageId: 目标语言 ID（从 targetLanguageIds 数组中获取）
  - ✅ translatedText: 空（在没有机器自动翻译的情况下默认为空）
  - ✅ status: 1（待翻译）
  - ✅ task_id: 关联到步骤1创建的翻译任务ID
- **AND** ✅ 更新翻译任务的 `text_count` 字段为实际创建的翻译记录总数
- **AND** ✅ 如果翻译键（UUID）在相同项目、相同语言下已存在，则跳过（不重复创建）
- **AND** ✅ 返回推送结果统计（成功数、失败数、错误信息、任务ID、任务编号）
- **实现位置**：
  - ✅ 后端接口：POST `/api/translation/push-default-json`（已添加到 OAuth 和 CSRF 白名单，无需用户认证）
  - ✅ 服务方法：`TranslationService.pushDefaultJson(projectId, defaultJsonPath, defaultJsonData)`
  - ✅ 推送脚本：`scripts/i18n-push.js`（命令行工具，使用 commander + axios，自动处理 CSRF token）
  - ✅ npm 脚本：`npm run i18n:push`
  - ✅ 配置：`config/config.default.js`（OAuth 和 CSRF 白名单配置）

### Requirement: 翻译任务管理（已完成）
系统 SHALL 提供翻译任务的创建、查询、更新和管理功能，支持任务与翻译记录的关联。

#### Scenario: 查看翻译任务列表（已完成）
- **WHEN** 用户访问翻译任务列表页面
- **THEN** ✅ 系统显示所有翻译任务
- **AND** ✅ 列表包含：任务编号、项目名称、文案条数、状态、是否回填、进度、创建时间等信息
- **AND** ✅ 进度条可视化显示任务完成进度（已完成数/总条数）
- **AND** ✅ 状态标签使用不同颜色区分（待翻译-警告色、翻译中-主色、待审核-信息色、已完成-成功色、已取消-危险色）
- **AND** ✅ 回填状态标签显示（已回填-成功色、未回填-信息色）
- **AND** ✅ 支持按任务编号筛选（输入框，支持模糊搜索，回车触发）
- **AND** ✅ 支持按项目名称筛选（输入框，支持模糊搜索，回车触发）
- **AND** ✅ 支持按状态筛选（下拉选择：待翻译、翻译中、待审核、已完成、已取消，选择即触发）
- **AND** ✅ 支持按是否回填筛选（下拉选择：未回填、已回填，选择即触发）
- **AND** ✅ 支持查看详情操作（跳转到任务详情页面）
- **AND** ✅ 支持编辑任务操作（打开编辑对话框，支持修改任务状态）
- **AND** ✅ 支持删除任务操作（确认后删除任务）
- **AND** ✅ 支持新增任务操作（打开创建对话框，选择项目并设置初始状态）
- **AND** ✅ 支持刷新列表操作（重新加载任务列表）
- **实现位置**：
  - ✅ 后端接口：GET `/api/translation/tasks`（支持查询参数：taskNumber、projectName、status、isBackfilled）
  - ✅ 前端页面：`views/translation/tasks/index.vue`
  - ✅ 前端服务：`service/translation.ts`（getTranslationTaskList、createTranslationTask、updateTranslationTask、deleteTranslationTask）

#### Scenario: 查看翻译任务详情（已完成）
- **WHEN** 用户点击某个翻译任务
- **THEN** ✅ 系统显示任务详细信息
  - ✅ 使用描述列表展示：任务编号、项目名称、文案条数、状态、是否回填、进度、创建时间
  - ✅ 进度条可视化显示任务完成进度（已完成数/总条数）
  - ✅ 状态和回填状态使用标签显示
- **AND** ✅ 显示任务关联的所有翻译记录列表
  - ✅ 表格形式展示：翻译键（UUID）、源文本、翻译文本、语言、状态、更新时间
  - ✅ 翻译文本为空时显示"未翻译"提示
  - ✅ 支持文本溢出提示（show-overflow-tooltip）
  - ✅ 显示语言名称（从关联的 Language 表获取）
  - ✅ 翻译状态标签显示（待翻译、翻译中、已完成）
- **AND** ✅ 显示任务进度统计（已完成数/总数）
- **AND** ✅ 支持回填操作
  - ✅ 仅当任务未回填时显示回填按钮
  - ✅ 将已完成的翻译结果回填到对应的语言文件（如 en-US.json）
  - ✅ 回填后更新任务的 is_backfilled 字段为 1
  - ✅ 显示回填结果统计（成功数、失败数、错误信息）
- **AND** ✅ 支持刷新详情操作（重新加载任务详情和翻译记录）
- **AND** ✅ 支持返回列表操作（返回任务列表页面）
- **实现位置**：
  - ✅ 后端接口：GET `/api/translation/tasks/:id`（返回任务信息和关联的翻译记录）
  - ✅ 后端接口：POST `/api/translation/tasks/:id/backfill`（执行回填操作）
  - ✅ 前端页面：`views/translation/tasks/detail.vue`
  - ✅ 前端服务：`service/translation.ts`（getTranslationTaskDetail、backfillTranslationTask）

#### Scenario: 创建翻译任务（已完成）
- **WHEN** 用户创建新的翻译任务
- **THEN** ✅ 系统自动生成唯一任务编号
- **AND** ✅ 用户提供项目ID、翻译人员、审核人员等信息
- **AND** ✅ 系统创建任务并设置初始状态为"待翻译"
- **AND** ✅ 返回创建的任务信息
- **实现位置**：
  - ✅ 后端接口：POST `/api/translation/tasks`
  - ✅ 服务方法：`TranslationTaskService.generateTaskNumber()`

#### Scenario: 更新翻译任务状态（已完成）
- **WHEN** 用户更新任务状态
- **THEN** ✅ 系统更新任务状态（待翻译、翻译中、待审核、已完成、已取消）
- **AND** ✅ 记录状态变更时间
- **实现位置**：
  - ✅ 后端接口：PATCH `/api/translation/tasks/:id/status`
  - ✅ 服务方法：`TranslationTaskService.updateStatus()`

#### Scenario: 回填翻译结果（已完成）
- **WHEN** 用户执行回填操作
- **THEN** ✅ 系统获取任务关联的所有已完成的翻译记录
- **AND** ✅ 将翻译结果回填到对应的语言文件（如 en-US.json）
- **AND** ✅ 更新任务的 is_backfilled 字段为 1（已回填）
- **AND** ✅ 返回回填结果统计
- **实现位置**：
  - ✅ 后端接口：POST `/api/translation/tasks/:id/backfill`
  - ✅ 服务方法：`TranslationTaskService.backfill()`
  - ✅ 前端按钮：任务详情页的"回填翻译结果"按钮

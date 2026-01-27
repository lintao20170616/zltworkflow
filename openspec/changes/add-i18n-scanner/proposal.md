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

- **推送 default.json 到翻译平台（已完成）**
  - ✅ **接口要求**：必须提供项目 ID（projectId）作为必填参数
  - ✅ **执行流程**：
    1. ✅ 首先创建一个翻译任务（自动生成任务编号、设置项目名称、初始状态为"待翻译"）
    2. ✅ 读取 default.json 数据（支持从请求体接收或从文件路径读取）
    3. ✅ 解析 JSON 数据（格式：`{ "uuid": "中文文案" }`）
    4. ✅ 获取项目的 `targetLanguageIds`（目标语言ID列表）
    5. ✅ 为每个 UUID 在每个目标语言下创建翻译记录：
       - key: UUID
       - sourceText: 中文文案
       - languageId: 目标语言 ID（从 targetLanguageIds 中获取）
       - translatedText: 空（在没有机器自动翻译的情况下默认为空）
       - status: 1（待翻译）
       - taskId: 关联到步骤1创建的翻译任务ID
    6. ✅ 更新翻译任务的 `text_count` 字段（等于创建的翻译记录总数）
    7. ✅ 如果翻译键（UUID）已存在，则跳过（不重复创建）
    8. ✅ 返回推送结果统计（成功数、失败数、错误信息、任务ID）
  - ✅ 接口：POST `/api/translation/push-default-json`
    - ✅ 接口已添加到 OAuth 和 CSRF 白名单（无需用户认证）
    - ✅ 支持两种方式：
      - 方式1：从请求体接收 `defaultJson` 对象（脚本调用）
      - 方式2：从 `defaultJsonPath` 文件路径读取（兼容旧方式）
  - ✅ 推送脚本：`scripts/i18n-push.js`，可通过 `npm run i18n:push` 执行
    - ✅ 技术栈：使用 `commander` 进行命令行参数解析，使用 `axios` 发送 HTTP 请求（参考 `scripts/index.js`）
    - ✅ 支持命令行参数：
      - `-p, --project-id <id>`：翻译项目ID（可通过环境变量 `PROJECT_ID` 设置，默认: 2）
      - `-f, --file <path>`：default.json 文件路径（默认: `client/spa/apps/default/i18n/locales/default.json`）
      - `-a, --api-url <url>`：API基础URL（可通过环境变量 `API_BASE_URL` 设置，默认: `http://localhost:9090`）
    - ✅ 自动处理 CSRF token（通过访问接口获取 cookie 中的 CSRF token）
    - ✅ 读取 default.json 文件并发送到服务端接口
    - ✅ 支持环境变量配置，便于 CI/CD 集成

- **翻译任务模块（已完成）**
  - ✅ **后端：扩展翻译任务表**
    - ✅ 新增字段：`task_number`（任务编号，唯一标识）
    - ✅ 新增字段：`project_name`（项目名称，冗余存储便于查询）
    - ✅ 新增字段：`text_count`（文案条数，任务包含的翻译记录数量）
    - ✅ 新增字段：`is_backfilled`（是否回填，TINYINT，0-否，1-是）
    - ✅ 保留现有字段：`status`（状态）、`project_id`、`translator_id`、`reviewer_id` 等
    - ✅ 迁移脚本：`database/migrations/006_extend_translation_tables.sql`
  - ✅ **后端：扩展 Translation 表**
    - ✅ 新增字段：`task_id`（关联翻译任务ID，可为空）
    - ✅ 建立与 `translation_tasks` 表的关联关系
    - ✅ 添加外键约束和索引
  - ✅ **后端服务层**
    - ✅ `TranslationService.pushDefaultJson()` - 推送 default.json 到翻译平台
    - ✅ `TranslationTaskService.generateTaskNumber()` - 生成唯一任务编号
    - ✅ `TranslationTaskService.getDetail()` - 获取任务详情（包含关联的翻译记录）
    - ✅ `TranslationTaskService.backfill()` - 回填翻译结果到语言文件
    - ✅ `TranslationTaskService.delete()` - 删除任务
    - ✅ `TranslationTaskService.list()` - 支持新的筛选条件（taskNumber、projectName、isBackfilled）
  - ✅ **后端控制器层**
    - ✅ `TranslationController.pushDefaultJson()` - 推送接口
    - ✅ `TranslationTaskController.getDetail()` - 任务详情接口
    - ✅ `TranslationTaskController.backfill()` - 回填接口
    - ✅ `TranslationTaskController.delete()` - 删除接口
    - ✅ 更新 `list()` 和 `create()` 方法支持新字段
  - ✅ **前端：新增翻译任务管理模块**
    - ✅ **翻译任务列表页面**（`views/translation/tasks/index.vue`）
      - ✅ **列表展示功能**：
        - ✅ 表格形式展示所有翻译任务
        - ✅ 显示字段：任务编号、项目名称、文案条数、状态、是否回填、进度、创建时间
        - ✅ 进度条可视化显示任务完成进度（已完成数/总条数）
        - ✅ 状态标签颜色区分（待翻译-警告色、翻译中-主色、待审核-信息色、已完成-成功色、已取消-危险色）
        - ✅ 回填状态标签显示（已回填-成功色、未回填-信息色）
      - ✅ **筛选功能**：
        - ✅ 按任务编号筛选（输入框，支持模糊搜索）
        - ✅ 按项目名称筛选（输入框，支持模糊搜索）
        - ✅ 按状态筛选（下拉选择：待翻译、翻译中、待审核、已完成、已取消）
        - ✅ 按是否回填筛选（下拉选择：未回填、已回填）
        - ✅ 筛选条件实时生效（输入框支持回车触发，下拉框选择即触发）
      - ✅ **操作功能**：
        - ✅ 查看详情：跳转到任务详情页面
        - ✅ 编辑任务：打开编辑对话框，支持修改任务状态
        - ✅ 删除任务：确认后删除任务
        - ✅ 新增任务：打开创建对话框，选择项目并设置初始状态
        - ✅ 刷新列表：重新加载任务列表
    - ✅ **翻译任务详情页面**（`views/translation/tasks/detail.vue`）
      - ✅ **任务信息展示**：
        - ✅ 使用描述列表展示任务基本信息
        - ✅ 显示字段：任务编号、项目名称、文案条数、状态、是否回填、进度、创建时间
        - ✅ 进度条可视化显示任务完成进度
        - ✅ 状态和回填状态使用标签显示
      - ✅ **翻译记录列表**：
        - ✅ 表格形式展示任务关联的所有翻译记录
        - ✅ 显示字段：翻译键（UUID）、源文本、翻译文本、语言、状态、更新时间
        - ✅ 翻译文本为空时显示"未翻译"提示
        - ✅ 支持文本溢出提示（show-overflow-tooltip）
        - ✅ 显示语言名称（从关联的 Language 表获取）
        - ✅ 翻译状态标签显示（待翻译、翻译中、已完成）
      - ✅ **操作功能**：
        - ✅ 回填翻译结果：将已完成的翻译结果回填到对应的语言文件（如 en-US.json）
          - ✅ 仅当任务未回填时显示回填按钮
          - ✅ 回填后更新任务的 is_backfilled 字段为 1
          - ✅ 显示回填结果统计（成功数、失败数、错误信息）
        - ✅ 刷新详情：重新加载任务详情和翻译记录
        - ✅ 返回列表：返回任务列表页面
  - ✅ **路由配置**
    - ✅ 后端：`/api/translation/push-default-json`、`/api/translation/tasks/:id`、`/api/translation/tasks/:id/backfill` 等
    - ✅ 前端：`/translation/tasks`、`/translation/tasks/:id`

## Impact

- **受影响的规范**：
  - 新增 `i18n-scanner` 功能规范
  - 扩展 `translation-platform` 功能规范（支持导入扫描结果）
- **受影响的代码**：
  - ✅ 已完成：`scripts/i18n-scanner.js`（扫描脚本）
  - ✅ 已完成：`client/spa/apps/default/i18n/index.ts`（自定义 $t 方法）
  - ✅ 已完成：`database/migrations/006_extend_translation_tables.sql`（数据库迁移脚本）
  - ✅ 已完成：后端扩展 `app/model/translationTask.js`（新增字段和关联关系）
  - ✅ 已完成：后端扩展 `app/model/translation.js`（新增 task_id 字段和关联关系）
  - ✅ 已完成：后端扩展 `app/service/translation.js`（添加 pushDefaultJson 方法）
  - ✅ 已完成：后端扩展 `app/service/translationTask.js`（添加任务管理方法）
  - ✅ 已完成：后端扩展 `app/controller/translation.js`（添加推送接口）
  - ✅ 已完成：后端扩展 `app/controller/translationTask.js`（添加任务管理接口）
  - ✅ 已完成：前端新增 `client/spa/apps/default/views/translation/tasks/` 目录和相关页面
  - ✅ 已完成：前端扩展 `client/spa/apps/default/service/translation.ts`（添加任务相关 API）
  - ✅ 已完成：推送脚本 `scripts/i18n-push.js`（命令行工具，使用 commander + axios，支持 CSRF token 处理）
  - ✅ 已完成：配置更新（`config/config.default.js`）- 推送接口添加到 OAuth 和 CSRF 白名单
  - ✅ 已完成：路由：新增 `/api/translation/push-default-json` 接口
  - ✅ 已完成：路由：新增 `/api/translation/tasks/*` 相关路由
  - ✅ 已完成：前端路由：新增 `/translation/tasks` 和 `/translation/tasks/:id` 路由


## ADDED Requirements

### Requirement: 扫描 i18n $t 函数（已完成）
系统 SHALL 提供代码扫描功能，自动扫描指定路径下的代码文件，提取 i18n 的 $t 函数中使用的翻译键。

#### Scenario: 扫描项目路径中的 $t 函数
- **WHEN** 用户运行扫描脚本 `npm run i18n:scan`
- **THEN** 系统扫描 `client/spa/apps/default` 路径下的 .vue、.ts、.js 文件
- **AND** 提取所有 $t() 函数调用中的中文文案（如 `$t('你好')`、`t('你好')`）
- **AND** 为每个唯一的中文文案生成 UUID
- **AND** 生成 default.json 文件，格式为：`{ "uuid": "中文文案" }`

### Requirement: 推送 default.json 到翻译平台
系统 SHALL 支持将本地的 default.json 文件推送到翻译平台，自动创建翻译内容并生成翻译任务。

#### Scenario: 推送 default.json 到翻译项目
- **WHEN** 用户提供翻译项目 ID（projectId，必填）并调用推送接口
- **THEN** 系统首先创建一个翻译任务：
  - task_number: 自动生成唯一任务编号
  - project_id: 提供的项目 ID
  - project_name: 从项目信息中获取项目名称
  - text_count: 初始为 0，后续更新为实际创建的翻译记录总数
  - status: 1（待翻译）
  - is_backfilled: 0（未回填）
- **AND** 系统读取本地 default.json 文件（路径：`client/spa/apps/default/i18n/locales/default.json`）
- **AND** 系统解析 JSON 数据（格式：`{ "uuid": "中文文案" }`）
- **AND** 系统获取项目的 `targetLanguageIds`（目标语言ID列表，JSON数组）
- **AND** 为每个 UUID 在每个目标语言下创建翻译记录：
  - key: UUID
  - project_id: 提供的项目 ID
  - sourceText: 中文文案
  - languageId: 目标语言 ID（从 targetLanguageIds 数组中获取）
  - translatedText: 空（在没有机器自动翻译的情况下默认为空）
  - status: 1（待翻译）
  - task_id: 关联到步骤1创建的翻译任务ID
- **AND** 更新翻译任务的 `text_count` 字段为实际创建的翻译记录总数
- **AND** 如果翻译键（UUID）在相同项目、相同语言下已存在，则跳过（不重复创建）
- **AND** 返回推送结果统计（成功数、失败数、错误信息、任务ID、任务编号）

### Requirement: 翻译任务管理
系统 SHALL 提供翻译任务的创建、查询、更新和管理功能，支持任务与翻译记录的关联。

#### Scenario: 查看翻译任务列表
- **WHEN** 用户访问翻译任务列表页面
- **THEN** 系统显示所有翻译任务
- **AND** 列表包含：任务编号、项目名称、文案条数、状态、是否回填、创建时间等信息
- **AND** 支持按任务编号、项目名称、状态、是否回填等条件筛选
- **AND** 支持按创建时间、更新时间排序

#### Scenario: 查看翻译任务详情
- **WHEN** 用户点击某个翻译任务
- **THEN** 系统显示任务详细信息
- **AND** 显示任务关联的所有翻译记录列表
- **AND** 显示任务进度统计（已完成数/总数）
- **AND** 支持在任务详情页编辑翻译内容

#### Scenario: 创建翻译任务
- **WHEN** 用户创建新的翻译任务
- **THEN** 系统自动生成唯一任务编号
- **AND** 用户提供项目ID、翻译人员、审核人员等信息
- **AND** 系统创建任务并设置初始状态为"待翻译"
- **AND** 返回创建的任务信息

#### Scenario: 更新翻译任务状态
- **WHEN** 用户更新任务状态
- **THEN** 系统更新任务状态（待翻译、翻译中、待审核、已完成、已取消）
- **AND** 记录状态变更时间
- **AND** 如果任务状态变更为"已完成"，自动更新任务进度为100%

#### Scenario: 回填翻译结果
- **WHEN** 用户执行回填操作
- **THEN** 系统获取任务关联的所有已完成的翻译记录
- **AND** 将翻译结果回填到对应的语言文件（如 en-US.json）
- **AND** 更新任务的 is_backfilled 字段为 1（已回填）
- **AND** 返回回填结果统计

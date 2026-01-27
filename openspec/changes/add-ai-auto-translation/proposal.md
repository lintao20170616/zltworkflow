# Change: 实现AI模型自动翻译

## Why

当前翻译平台需要人工逐条翻译，效率较低。通过集成AI模型（Ollama）实现自动翻译功能，可以大幅提升翻译效率，减少人工工作量。系统已具备Ollama服务集成能力，可以复用现有基础设施。

## What Changes

- **新增AI自动翻译功能**
  - 支持单个翻译内容的AI自动翻译
  - 支持批量翻译任务的AI自动翻译
  - 翻译结果自动填充到翻译内容中
  - 翻译状态自动更新（翻译中 -> 已完成）
- **集成Ollama翻译服务**
  - 复用现有Ollama服务基础设施
  - 实现翻译专用的prompt模板
  - 支持多语言对翻译（源语言 -> 目标语言）
  - 错误处理和降级机制
- **翻译任务增强**
  - 任务支持AI自动翻译模式
  - 批量翻译时显示进度和统计
  - 支持AI翻译后的人工审核流程

## Impact

- **受影响的规范**：
  - 修改 `translation-platform` 功能规范，新增AI自动翻译相关需求
- **受影响的代码**：
  - 后端：
    - `app/service/translation.js` - 新增AI翻译方法
    - `app/service/translationTask.js` - 新增批量AI翻译方法
    - `app/controller/translation.js` - 新增AI翻译接口
    - `app/controller/translationTask.js` - 新增批量AI翻译接口
  - 前端：
    - `client/spa/apps/default/views/translation/tasks/detail.vue` - 新增批量AI翻译功能
    - `client/spa/apps/default/service/translation.ts` - 新增AI翻译API调用
- **依赖关系**：
  - 依赖现有Ollama服务（`app/lib/plugin/ollama`）
  - 需要Ollama服务可用且配置正确


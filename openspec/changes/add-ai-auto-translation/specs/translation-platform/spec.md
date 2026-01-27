## ADDED Requirements

### Requirement: AI自动翻译
系统 SHALL 提供基于AI模型的自动翻译功能，支持单个翻译内容和批量翻译任务的自动翻译。系统 SHALL 使用Ollama服务进行翻译，并支持错误处理和降级机制。

#### Scenario: 单个翻译内容AI翻译
- **WHEN** 系统通过API调用单个翻译内容的AI翻译功能
- **THEN** 系统调用Ollama服务进行翻译
- **AND** 系统构建包含源语言、目标语言和源文本的翻译prompt
- **AND** Ollama返回翻译结果后，系统自动填充翻译文本
- **AND** 翻译状态自动更新为"已完成"（status = 3）
- **AND** 翻译记录显示AI翻译标识（translatorId可标记为系统用户或特殊值）

#### Scenario: 批量翻译任务AI翻译
- **WHEN** 用户在翻译任务详情页点击"批量AI翻译"按钮
- **THEN** 系统获取该任务下所有待翻译内容（status = 1）
- **AND** 系统逐个调用AI翻译服务
- **AND** 翻译过程中更新任务进度（progress字段）
- **AND** 翻译完成后更新任务统计（textCount、totalCount）
- **AND** 返回翻译结果统计（成功数、失败数、错误信息）

#### Scenario: AI翻译错误处理
- **WHEN** Ollama服务不可用或翻译失败
- **THEN** 系统记录错误日志
- **AND** 翻译状态保持为"待翻译"（status = 1）
- **AND** 向用户返回友好的错误提示
- **AND** 系统支持重试机制

#### Scenario: AI翻译prompt构建
- **WHEN** 系统需要调用AI翻译服务
- **THEN** 系统构建包含以下信息的prompt：
  - 源语言名称（如：中文、English）
  - 目标语言名称（如：English、中文）
  - 源文本内容
  - 翻译要求（保持原意、专业术语等）
- **AND** prompt模板可配置，支持自定义

#### Scenario: 多语言对翻译支持
- **WHEN** 用户对任意语言对的翻译内容进行AI翻译
- **THEN** 系统正确识别源语言和目标语言
- **AND** 系统调用Ollama服务并传递正确的语言信息
- **AND** 翻译结果符合目标语言的表达习惯

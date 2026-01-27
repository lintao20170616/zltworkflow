## 1. 后端实现

- [x] 1.1 在 `app/service/translation.js` 中实现 `translateWithAI` 方法
  - [x] 调用Ollama服务进行翻译
  - [x] 构建翻译专用的prompt（包含源语言、目标语言、源文本）
  - [x] 处理翻译结果并更新翻译记录
  - [x] 错误处理和日志记录

- [x] 1.2 在 `app/service/translationTask.js` 中实现 `batchTranslateWithAI` 方法
  - [x] 批量获取待翻译内容
  - [x] 逐个调用AI翻译
  - [x] 更新翻译状态和进度
  - [x] 返回翻译统计信息

- [x] 1.3 在 `app/controller/translation.js` 中新增 `translateWithAI` 接口
  - [x] 接收翻译ID参数
  - [x] 调用service方法
  - [x] 返回翻译结果

- [x] 1.4 在 `app/controller/translationTask.js` 中新增 `batchTranslateWithAI` 接口
  - [x] 接收任务ID参数
  - [x] 调用service方法
  - [x] 返回批量翻译结果和统计

- [x] 1.5 在 `app/router.js` 中注册新路由
  - [x] `POST /api/translation/:id/translate-with-ai`
  - [x] `POST /api/translation-task/:id/batch-translate-with-ai`

## 2. 前端实现

- [x] 2.1 在 `client/spa/apps/default/service/translation.ts` 中新增API方法
  - [x] `translateWithAI(translationId: number)`
  - [x] `batchTranslateWithAI(taskId: number)`

- [x] 2.2 在任务详情页（`tasks/detail.vue`）中新增批量AI翻译功能
  - [x] 添加"批量AI翻译"按钮
  - [x] 显示翻译进度（可选）
  - [x] 翻译完成后刷新任务统计
  - [x] 错误提示处理

## 3. 配置和优化

- [ ] 3.1 添加翻译相关的Ollama配置项
  - [ ] 翻译模型选择（可配置）
  - [ ] 翻译prompt模板配置
  - [ ] 翻译超时时间配置

- [ ] 3.2 优化翻译prompt
  - [ ] 设计高效的翻译prompt模板
  - [ ] 支持上下文信息（项目名称、领域等）
  - [ ] 确保翻译质量

- [ ] 3.3 错误处理优化
  - [ ] Ollama服务不可用时的降级处理
  - [ ] 翻译失败时的重试机制
  - [ ] 详细的错误日志记录

## 4. 测试

- [ ] 4.1 测试单个翻译的AI翻译功能
- [ ] 4.2 测试批量翻译的AI翻译功能
- [ ] 4.3 测试Ollama服务不可用时的降级处理
- [ ] 4.4 测试不同语言对的翻译效果

## 1. 后端实现

- [ ] 1.1 创建 i18n 扫描服务（`app/service/i18nScanner.js`）
  - [ ] 实现代码文件扫描逻辑（支持 .vue、.ts、.js 文件）
  - [ ] 实现 $t 函数提取逻辑（正则匹配 `$t('key')`、`this.$t('key')`、`t('key')` 等模式）
  - [ ] 提取翻译键并去重
  - [ ] 生成键值对 JSON 格式（键为翻译键，值为空字符串）
  - [ ] 返回扫描结果（文件路径、翻译键、行号等信息）

- [ ] 1.2 创建 i18n 扫描控制器（`app/controller/i18nScanner.js`）
  - [ ] 实现扫描接口（POST `/api/i18n/scanner/scan`）
    - 接收参数：项目路径（可选，默认扫描 client/spa 目录）
    - 返回扫描结果和生成的键值对 JSON

- [ ] 1.3 扩展翻译平台服务（`app/service/translation.js`）
  - [ ] 添加批量导入方法 `importFromScanner(projectId, keyValueJson)`
    - 解析键值对 JSON
    - 获取项目信息（源语言和目标语言）
    - 为每个键创建源语言的翻译记录（key 作为 sourceText）
    - 为每个目标语言创建对应的翻译记录（状态为"待翻译"）
    - 返回导入结果统计

- [ ] 1.4 扩展翻译平台控制器（`app/controller/translation.js`）
  - [ ] 添加导入接口（POST `/api/translation/import-from-scanner`）
    - 接收参数：projectId、keyValueJson
    - 调用服务层方法导入数据
    - 返回导入结果

- [ ] 1.5 添加路由配置（`app/router.js`）
  - [ ] 添加扫描接口路由
  - [ ] 添加导入接口路由

## 2. 测试

- [ ] 2.1 测试扫描功能
  - [ ] 测试扫描 .vue 文件中的 $t 函数
  - [ ] 测试扫描 .ts/.js 文件中的 $t 函数
  - [ ] 测试提取不同格式的 $t 调用（`$t('key')`、`this.$t('key')`、`t('key')`）
  - [ ] 测试生成键值对 JSON

- [ ] 2.2 测试导入功能
  - [ ] 测试导入键值对 JSON 到翻译项目
  - [ ] 测试为源语言和目标语言创建翻译记录
  - [ ] 测试重复键的处理逻辑

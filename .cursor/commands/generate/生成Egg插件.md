# 生成 Egg.js 插件

请根据要求生成 Egg.js 框架的插件代码：

## 插件结构

Egg 插件位于 `lib/plugin/{name}/` 目录，包含以下文件：

1. **app.js** - 插件主文件，定义插件功能
2. **config/config.default.js** - 默认配置文件
3. **package.json** - 插件包信息

## 文件模板

### app.js 模板

```javascript
module.exports = (app) => {
  app.beforeStart(async () => {
    app.logger.info('[egg-{name}] plugin loaded');
  });

  app.{name} = {
    // 插件方法
  };
};
```

### config/config.default.js 模板

```javascript
module.exports = () => {
  const config = {};

  config.{name} = {
    // 插件配置项
  };

  return config;
};
```

### package.json 模板

```json
{
  "name": "egg-{name}",
  "version": "1.0.0",
  "description": "{description}",
  "eggPlugin": {
    "name": "{name}"
  }
}
```

## 生成规则

### 1. 命名规范

- 插件名称：使用小写字母和连字符，如 `oauth`、`redis-cache`
- 插件目录：`lib/plugin/{name}/`
- 包名：`egg-{name}`
- 配置键名：与插件名称一致

### 2. 代码规范

- 使用 2 空格缩进
- 使用单引号
- 使用 `async/await` 处理异步操作
- 使用 `app.logger` 记录日志
- 包含必要的错误处理

### 3. 插件注册

生成插件后，需要在 `config/plugin.js` 中注册：

```javascript
const path = require('path');

module.exports = {
  // ... 其他插件
  {name}: {
    enable: true,
    path: path.join(__dirname, '../lib/plugin/{name}'),
  },
};
```

## 插件类型

### 1. 功能插件

提供特定功能，如 OAuth、缓存、日志等：

```javascript
module.exports = (app) => {
  app.beforeStart(async () => {
    app.logger.info('[egg-{name}] plugin loaded');
  });

  app.{name} = {
    async method1(params) {
      // 功能实现
    },
    async method2(params) {
      // 功能实现
    },
  };
};
```

### 2. 中间件插件

提供中间件功能：

```javascript
module.exports = (app) => {
  app.beforeStart(async () => {
    app.logger.info('[egg-{name}] plugin loaded');
  });

  app.config.coreMiddleware.push('{name}');
};
```

### 3. 扩展插件

扩展框架对象：

```javascript
module.exports = (app) => {
  app.beforeStart(async () => {
    app.logger.info('[egg-{name}] plugin loaded');
  });

  // 扩展 application
  app.{name} = {
    // 方法
  };

  // 扩展 context
  app.context.{name} = {
    // 方法
  };
};
```

## 生成要求

1. **文件结构**

   - 创建 `lib/plugin/{name}/` 目录
   - 生成 `app.js` 主文件
   - 生成 `config/config.default.js` 配置文件
   - 生成 `package.json` 包信息文件

2. **插件注册**

   - 自动更新 `config/plugin.js` 注册插件
   - 使用相对路径引用插件
   - 设置 `enable: true` 启用插件

3. **代码质量**

   - 使用 `async/await` 处理异步操作
   - 包含错误处理逻辑
   - 使用 `app.logger` 记录日志
   - 配置项有合理的默认值

4. **配置管理**

   - 配置项放在 `config.{name}` 下
   - 提供清晰的配置说明
   - 支持环境变量覆盖

## 使用示例

**生成 OAuth 插件：**

- 插件名称：oauth
- 插件描述：OAuth 认证插件
- 功能：提供 OAuth 认证功能
- 配置项：providers、defaultProvider

**生成缓存插件：**

- 插件名称：redis-cache
- 插件描述：Redis 缓存插件
- 功能：提供 Redis 缓存功能
- 配置项：host、port、password、db

**生成日志插件：**

- 插件名称：custom-logger
- 插件描述：自定义日志插件
- 功能：提供自定义日志功能
- 配置项：level、format、output

## 输出要求

1. **生成完整的插件文件**

   - 创建插件目录结构
   - 生成所有必需的文件
   - 代码符合项目规范

2. **自动注册插件**

   - 更新 `config/plugin.js` 注册插件
   - 使用正确的路径引用
   - 启用插件

3. **代码质量**

   - 使用 async/await 处理异步
   - 包含错误处理
   - 使用 logger 记录日志
   - 配置项有默认值

4. **文档说明**

   - 说明插件功能
   - 说明配置项含义
   - 提供使用示例

## 执行步骤

1. 确认插件名称和功能
2. 创建插件目录结构
3. 生成 `app.js` 主文件
4. 生成 `config/config.default.js` 配置文件
5. 生成 `package.json` 包信息
6. 更新 `config/plugin.js` 注册插件
7. 检查代码规范
8. 提供使用说明

请根据用户需求生成对应的 Egg.js 插件代码，确保代码质量和规范性。

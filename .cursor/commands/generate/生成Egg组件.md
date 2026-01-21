# 生成 Egg.js 组件

请根据要求生成 Egg.js 框架的组件代码：

## 组件类型

### 1. Controller（控制器）

- 路径：`app/controller/{name}.js`
- 继承 `egg.Controller`
- 包含标准的 CRUD 方法
- 使用 `async/await` 处理异步操作
- 包含错误处理和参数验证

### 2. Service（服务层）

- 路径：`app/service/{name}.js`
- 继承 `egg.Service`
- 包含业务逻辑方法
- 可访问 `this.ctx`、`this.app`、`this.config`
- 方法使用 `async/await`

### 3. Middleware（中间件）

- 路径：`app/middleware/{name}.js`
- 导出函数，接收 `options` 参数
- 返回异步函数 `async (ctx, next) => {}`
- 支持配置选项

### 4. Model（数据模型）

- 路径：`app/model/{name}.js`
- 如果使用 Sequelize：定义模型和关联
- 如果使用 Mongoose：定义 Schema
- 包含字段定义和验证规则

### 5. Extend（扩展）

- 路径：`app/extend/{type}.js`
- 类型：`application.js`、`context.js`、`request.js`、`response.js`、`helper.js`
- 扩展框架内置对象的方法

## 生成规则

### Controller 模板

```javascript
const { Controller } = require('egg');

class {Name}Controller extends Controller {
  async index() {
    const { ctx } = this;
    ctx.body = 'success';
  }

  async show() {
    const { ctx } = this;
    const { id } = ctx.params;
    ctx.body = { id };
  }

  async create() {
    const { ctx } = this;
    ctx.body = 'create success';
  }

  async update() {
    const { ctx } = this;
    const { id } = ctx.params;
    ctx.body = { id, message: 'update success' };
  }

  async destroy() {
    const { ctx } = this;
    const { id } = ctx.params;
    ctx.body = { id, message: 'delete success' };
  }
}

module.exports = {Name}Controller;
```

**注意：** 根据项目风格，也可以使用 `const Controller = require('egg').Controller;`

### Service 模板

```javascript
const { Service } = require('egg');

/**
 * @class {Name}Service
 * @augments Service
 * @description {描述信息}
 */
class {Name}Service extends Service {
  /**
   * 根据ID查找
   * @param {number|string} id - ID
   * @return {Promise<Object>} - 返回数据
   */
  async findById(id) {
    return { id };
  }

  /**
   * 创建数据
   * @param {Object} data - 数据对象
   * @return {Promise<Object>} - 返回创建的数据
   */
  async create(data) {
    return data;
  }

  /**
   * 更新数据
   * @param {number|string} id - ID
   * @param {Object} data - 更新的数据
   * @return {Promise<Object>} - 返回更新后的数据
   */
  async update(id, data) {
    return { id, ...data };
  }

  /**
   * 删除数据
   * @param {number|string} id - ID
   * @return {Promise<boolean>} - 返回是否删除成功
   */
  async delete(id) {
    return { id };
  }
}

module.exports = {Name}Service;
```

### Middleware 模板

```javascript
module.exports = (options = {}) => {
  return async function {name}(ctx, next) {
    await next();
  };
};
```

## 生成要求

1. **命名规范**

   - Controller：使用 PascalCase，如 `UserController`
   - Service：使用 PascalCase，如 `UserService`
   - Middleware：使用 camelCase，如 `authMiddleware`
   - 文件名：使用小写，如 `user.js`

2. **代码规范**

   - 使用 2 空格缩进
   - 使用单引号
   - 方法之间空一行
   - 包含必要的注释

3. **功能要求**

   - Controller 方法需要参数验证
   - Service 方法需要错误处理
   - 使用 `ctx.logger` 记录日志
   - 返回统一的响应格式

4. **路由配置**
   - 如果生成 Controller，同时更新 `app/router.js`
   - 使用 RESTful 路由风格
   - 添加路由注释

## 路由配置示例

生成 Controller 后，需要在 `app/router.js` 中添加路由：

```javascript
module.exports = (app) => {
  const { router, controller } = app;
  // {Name} 相关路由
  router.resources('{name}', '/api/{name}', controller.{name});
  // 或者单独定义
  router.get('/api/{name}', controller.{name}.index);
  router.get('/api/{name}/:id', controller.{name}.show);
  router.post('/api/{name}', controller.{name}.create);
  router.put('/api/{name}/:id', controller.{name}.update);
  router.delete('/api/{name}/:id', controller.{name}.destroy);
};
```

## 使用示例

**生成 UserController：**

- 组件类型：Controller
- 组件名称：User
- 包含方法：index, show, create, update, destroy
- 路由前缀：/api/users

**生成 AuthService：**

- 组件类型：Service
- 组件名称：Auth
- 包含方法：login, logout, verifyToken

**生成 AuthMiddleware：**

- 组件类型：Middleware
- 组件名称：auth
- 功能：验证 token

## 输出要求

1. **生成完整的组件代码文件**

   - 文件路径正确（app/controller、app/service、app/middleware 等）
   - 代码符合项目规范（命名、格式、注释）
   - 包含必要的错误处理和日志记录

2. **路由配置更新**

   - 如果生成 Controller，自动更新 `app/router.js`
   - 使用 RESTful 风格的路由
   - 添加清晰的路由注释

3. **代码质量**

   - 使用 async/await 处理异步操作
   - 包含参数验证
   - 使用 ctx.logger 记录日志
   - 返回统一的响应格式

4. **文档说明**
   - 提供组件使用说明
   - 说明需要配置的参数
   - 提供调用示例

## 执行步骤

1. 确认组件类型和名称
2. 生成组件代码文件
3. 如果是 Controller，更新路由配置
4. 检查代码规范
5. 提供使用说明

请根据用户需求生成对应的 Egg.js 组件代码，确保代码质量和规范性。

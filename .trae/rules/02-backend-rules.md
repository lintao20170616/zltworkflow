---
alwaysApply: false
description: '后端开发规则，修改后端代码(app/controller/, app/service/, app/model/, config/)时必须遵守'
---

# 后端开发规则

## 架构约束
- 必须遵循 Controller → Service → Model 三层架构
- Controller 只处理HTTP请求响应，禁止包含业务逻辑
- Service 封装业务逻辑，禁止直接处理HTTP
- Model 只定义数据结构和关联，禁止包含业务逻辑

## 命名规范
- Controller文件: 小写 `xxx.js`，类名 `XxxController`
- Service文件: 小写 `xxx.js`，类名 `XxxService`
- Model文件: 小写 `xxx.js`，类名 `Xxx`
- 方法名: 动词开头 `getUserInfo()`
- 变量名: 小驼峰 `userName`
- 常量: 大写下划线 `MAX_RETRY_COUNT`

## 代码规范
- 参数必须校验，缺少参数返回400
- 所有业务逻辑必须try-catch包裹
- 异常必须记录日志 `ctx.logger.error()`
- 响应格式统一: `{ code, message, data }`
- 使用Sequelize ORM，禁止拼接SQL
- 数据库操作必须使用事务（多表操作）

## 路由规范
- 路径格式: `/api/resource/:id`
- 遵循RESTful: GET列表/POST创建/PUT更新/DELETE删除/PATCH状态
- 路由注册在 `app/router.js`

## 安全规范
- 密码使用bcryptjs加密，禁止明文存储
- Session使用Redis加密存储
- 输入参数必须校验，防止SQL注入和XSS
- OAuth中间件自动验证，白名单配置在config中
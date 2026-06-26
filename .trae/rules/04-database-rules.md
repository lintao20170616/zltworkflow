---
alwaysApply: false
description: '数据库开发规则，修改数据库模型(app/model/)或迁移脚本(database/migrations/)时必须遵守'
---

# 数据库开发规则

## 模型定义
- 使用Sequelize定义模型，禁止直接写SQL
- 主键使用自增INTEGER，命名为 `id`
- 外键命名为 `xxxId`
- 时间戳字段: `createdAt`, `updatedAt`
- 状态字段使用TINYINT，1启用/0禁用
- 每个字段必须添加comment说明

## 关联关系
- 一对一: `hasOne` / `belongsTo`
- 一对多: `hasMany` / `belongsTo`
- 多对多: `belongsToMany` + 关联表

## 迁移脚本
- 文件命名: `序号_描述.sql`
- 位置: `database/migrations/`
- 执行: `npm run migrate`
- 使用标准SQL语法
- 每个迁移作为一个事务

## 索引规范
- 主键自动创建
- 外键必须创建索引
- 查询条件字段创建索引
- 唯一约束字段创建UNIQUE索引

## 查询规范
- 使用Sequelize ORM，禁止拼接SQL
- 分页使用 `limit` + `offset`
- 关联查询使用 `include`
- 批量操作使用 `bulkCreate` / `bulkUpdate`

## 安全规范
- 密码字段使用bcryptjs加密
- 禁止存储明文敏感信息
- 使用参数化查询防止SQL注入
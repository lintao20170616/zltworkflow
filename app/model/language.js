'use strict';

module.exports = (app) => {
  const { STRING, INTEGER, TINYINT, DATE } = app.Sequelize;

  const Language = app.model.define(
    'Language',
    {
      id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '语言ID',
      },
      code: {
        type: STRING(16),
        allowNull: false,
        unique: true,
        comment: '语言代码（如：zh-CN, en-US）',
      },
      name: {
        type: STRING(64),
        allowNull: false,
        comment: '语言名称（如：简体中文、English）',
      },
      nativeName: {
        type: STRING(64),
        allowNull: true,
        field: 'native_name',
        comment: '本地名称',
      },
      flag: {
        type: STRING(32),
        allowNull: true,
        comment: '国旗图标标识',
      },
      status: {
        type: TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: '状态：1-启用，0-禁用',
      },
      sort: {
        type: INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '排序',
      },
      createdAt: {
        type: DATE,
        allowNull: false,
        field: 'created_at',
        comment: '创建时间',
        defaultValue: app.Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: DATE,
        allowNull: false,
        field: 'updated_at',
        comment: '更新时间',
        defaultValue: app.Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    },
    {
      tableName: 'languages',
      timestamps: true,
      underscored: false,
    },
  );

  return Language;
};

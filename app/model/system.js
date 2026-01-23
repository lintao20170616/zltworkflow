'use strict';

module.exports = (app) => {
  const { STRING, INTEGER, TINYINT, DATE } = app.Sequelize;

  const System = app.model.define(
    'System',
    {
      id: {
        type: INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: '系统ID',
      },
      code: {
        type: STRING(64),
        allowNull: false,
        unique: true,
        comment: '系统编码',
      },
      name: {
        type: STRING(128),
        allowNull: false,
        comment: '系统名称',
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
      tableName: 'systems',
      timestamps: true,
      underscored: false,
    },
  );

  System.beforeUpdate(async (system) => {
    delete system.dataValues.updatedAt;
  });

  System.associate = function () {
    if (app.model.Menu) {
      System.hasMany(app.model.Menu, {
        foreignKey: 'systemId',
        as: 'menus',
      });
    }
  };

  return System;
};

'use strict';

module.exports = (app) => {
  const { STRING, INTEGER, TINYINT, DATE } = app.Sequelize;

  const Menu = app.model.define(
    'Menu',
    {
      id: {
        type: INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: '菜单ID',
      },
      systemId: {
        type: INTEGER.UNSIGNED,
        allowNull: false,
        field: 'system_id',
        comment: '系统ID',
      },
      parentId: {
        type: INTEGER.UNSIGNED,
        allowNull: true,
        field: 'parent_id',
        comment: '父菜单ID',
      },
      title: {
        type: STRING(128),
        allowNull: false,
        comment: '菜单名称',
      },
      name: {
        type: STRING(64),
        allowNull: false,
        comment: '路由名称',
      },
      path: {
        type: STRING(255),
        allowNull: false,
        comment: '路由路径',
      },
      icon: {
        type: STRING(64),
        allowNull: true,
        comment: '图标名称',
      },
      component: {
        type: STRING(255),
        allowNull: true,
        comment: '前端组件标识/路径',
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
      tableName: 'menus',
      timestamps: true,
      underscored: false,
    },
  );

  Menu.beforeUpdate(async (menu) => {
    delete menu.dataValues.updatedAt;
  });

  Menu.associate = function () {
    if (app.model.System) {
      Menu.belongsTo(app.model.System, {
        foreignKey: 'systemId',
        as: 'system',
      });
    }

    Menu.belongsTo(app.model.Menu, {
      foreignKey: 'parentId',
      as: 'parent',
    });

    Menu.hasMany(app.model.Menu, {
      foreignKey: 'parentId',
      as: 'children',
    });
  };

  return Menu;
};

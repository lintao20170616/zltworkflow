'use strict';

module.exports = (app) => {
  const { INTEGER, DATE } = app.Sequelize;

  const UserRole = app.model.define(
    'UserRole',
    {
      id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '用户角色ID',
      },
      userId: {
        type: INTEGER,
        allowNull: false,
        field: 'user_id',
        comment: '用户ID',
      },
      roleId: {
        type: INTEGER,
        allowNull: false,
        field: 'role_id',
        comment: '角色ID',
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
      tableName: 'user_roles',
      timestamps: true,
      underscored: false,
    },
  );

  UserRole.beforeUpdate(async (userRole) => {
    delete userRole.dataValues.updatedAt;
  });

  return UserRole;
};

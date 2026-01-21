'use strict';

module.exports = (app) => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const Role = app.model.define(
    'Role',
    {
      id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '角色ID',
      },
      name: {
        type: STRING(50),
        allowNull: false,
        unique: true,
        comment: '角色名称',
      },
      description: {
        type: STRING(255),
        allowNull: true,
        comment: '角色描述',
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
      tableName: 'roles',
      timestamps: true,
      underscored: false,
    },
  );

  Role.beforeUpdate(async (role) => {
    delete role.dataValues.updatedAt;
  });

  Role.associate = function () {
    if (app.model.User && app.model.UserRole) {
      Role.belongsToMany(app.model.User, {
        through: app.model.UserRole,
        foreignKey: 'roleId',
        otherKey: 'userId',
        as: 'users',
      });
    }
  };

  return Role;
};

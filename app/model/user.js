'use strict';

module.exports = (app) => {
  const { STRING, INTEGER, TINYINT, DATE } = app.Sequelize;

  const User = app.model.define(
    'User',
    {
      id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '用户ID',
      },
      username: {
        type: STRING(50),
        allowNull: false,
        unique: true,
        comment: '用户名',
      },
      password: {
        type: STRING(255),
        allowNull: false,
        comment: '密码（bcrypt加密）',
      },
      email: {
        type: STRING(100),
        allowNull: true,
        comment: '邮箱',
      },
      status: {
        type: TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: '状态：1-启用，0-禁用',
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
      tableName: 'users',
      timestamps: true,
      underscored: false,
    },
  );

  const bcrypt = require('bcryptjs');

  User.beforeCreate(async (user) => {
    if (user.password) {
      user.password = await bcrypt.hash(user.password, 10);
    }
  });

  User.beforeUpdate(async (user) => {
    if (user.changed('password') && user.password) {
      user.password = await bcrypt.hash(user.password, 10);
    }
    delete user.dataValues.updatedAt;
  });

  User.prototype.validatePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

  User.associate = function () {
    if (app.model.Role && app.model.UserRole) {
      User.belongsToMany(app.model.Role, {
        through: app.model.UserRole,
        foreignKey: 'userId',
        otherKey: 'roleId',
        as: 'roles',
      });
    }
  };

  return User;
};

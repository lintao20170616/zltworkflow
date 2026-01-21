'use strict';

module.exports = (app) => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const Conversation = app.model.define(
    'Conversation',
    {
      id: {
        type: INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: '会话ID',
      },
      userId: {
        type: INTEGER.UNSIGNED,
        allowNull: false,
        field: 'user_id',
        comment: '用户ID',
      },
      title: {
        type: STRING(255),
        allowNull: true,
        comment: '会话标题',
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
      tableName: 'conversations',
      timestamps: true,
      underscored: false,
    },
  );

  Conversation.associate = function () {
    if (app.model.User) {
      Conversation.belongsTo(app.model.User, {
        foreignKey: 'userId',
        as: 'user',
      });
    }
    if (app.model.Message) {
      Conversation.hasMany(app.model.Message, {
        foreignKey: 'conversationId',
        as: 'messages',
      });
    }
  };

  return Conversation;
};

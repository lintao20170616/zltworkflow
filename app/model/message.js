'use strict';

module.exports = (app) => {
  const { STRING, INTEGER, TEXT, DATE, ENUM } = app.Sequelize;

  const Message = app.model.define(
    'Message',
    {
      id: {
        type: INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
        comment: '消息ID',
      },
      conversationId: {
        type: INTEGER.UNSIGNED,
        allowNull: false,
        field: 'conversation_id',
        comment: '会话ID',
      },
      role: {
        type: ENUM('user', 'bot'),
        allowNull: false,
        comment: '角色：user-用户，bot-机器人',
      },
      content: {
        type: TEXT,
        allowNull: false,
        comment: '消息内容',
      },
      createdAt: {
        type: DATE,
        allowNull: false,
        field: 'created_at',
        comment: '创建时间',
        defaultValue: app.Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    },
    {
      tableName: 'messages',
      timestamps: true,
      updatedAt: false,
      underscored: false,
    },
  );

  Message.associate = function () {
    if (app.model.Conversation) {
      Message.belongsTo(app.model.Conversation, {
        foreignKey: 'conversationId',
        as: 'conversation',
      });
    }
  };

  return Message;
};

'use strict';

module.exports = (app) => {
  const { INTEGER, TINYINT, DATE } = app.Sequelize;

  const TranslationTask = app.model.define(
    'TranslationTask',
    {
      id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '任务ID',
      },
      projectId: {
        type: INTEGER,
        allowNull: false,
        field: 'project_id',
        comment: '项目ID',
      },
      translatorId: {
        type: INTEGER,
        allowNull: true,
        field: 'translator_id',
        comment: '翻译人员ID',
      },
      reviewerId: {
        type: INTEGER,
        allowNull: true,
        field: 'reviewer_id',
        comment: '审核人员ID',
      },
      status: {
        type: TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: '状态：1-待翻译，2-翻译中，3-待审核，4-已完成，5-已取消',
      },
      progress: {
        type: INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: '进度（已完成数量）',
      },
      totalCount: {
        type: INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'total_count',
        comment: '总数量',
      },
      dueDate: {
        type: DATE,
        allowNull: true,
        field: 'due_date',
        comment: '截止日期',
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
      tableName: 'translation_tasks',
      timestamps: true,
      underscored: false,
    },
  );

  TranslationTask.associate = function () {
    if (app.model.TranslationProject) {
      TranslationTask.belongsTo(app.model.TranslationProject, {
        foreignKey: 'projectId',
        as: 'project',
      });
    }
  };

  return TranslationTask;
};

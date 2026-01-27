'use strict';

module.exports = (app) => {
  const { INTEGER, TINYINT, DATE, STRING } = app.Sequelize;

  const TranslationTask = app.model.define(
    'TranslationTask',
    {
      id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '任务ID',
      },
      taskNumber: {
        type: STRING(50),
        allowNull: false,
        unique: true,
        field: 'task_number',
        comment: '任务编号',
      },
      projectId: {
        type: INTEGER,
        allowNull: false,
        field: 'project_id',
        comment: '项目ID',
      },
      projectName: {
        type: STRING(255),
        allowNull: false,
        field: 'project_name',
        comment: '项目名称',
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
      textCount: {
        type: INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'text_count',
        comment: '文案条数',
      },
      isBackfilled: {
        type: TINYINT,
        allowNull: false,
        defaultValue: 0,
        field: 'is_backfilled',
        comment: '是否回填：0-否，1-是',
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
    if (app.model.Translation) {
      TranslationTask.hasMany(app.model.Translation, {
        foreignKey: 'taskId',
        as: 'translations',
      });
    }
  };

  return TranslationTask;
};

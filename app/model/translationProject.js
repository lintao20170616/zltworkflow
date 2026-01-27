'use strict';

module.exports = (app) => {
  const { STRING, INTEGER, TINYINT, DATE, TEXT, JSON } = app.Sequelize;

  const TranslationProject = app.model.define(
    'TranslationProject',
    {
      id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '项目ID',
      },
      name: {
        type: STRING(128),
        allowNull: false,
        comment: '项目名称',
      },
      description: {
        type: TEXT,
        allowNull: true,
        comment: '项目描述',
      },
      sourceLanguageId: {
        type: INTEGER,
        allowNull: false,
        field: 'source_language_id',
        comment: '源语言ID',
      },
      targetLanguageIds: {
        type: JSON,
        allowNull: true,
        field: 'target_language_ids',
        comment: '目标语言ID列表（JSON数组）',
      },
      status: {
        type: TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: '状态：1-进行中，2-已完成，3-已归档',
      },
      createdBy: {
        type: INTEGER,
        allowNull: true,
        field: 'created_by',
        comment: '创建人ID',
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
      tableName: 'translation_projects',
      timestamps: true,
      underscored: false,
    },
  );

  TranslationProject.associate = function () {
    if (app.model.Language) {
      TranslationProject.belongsTo(app.model.Language, {
        foreignKey: 'sourceLanguageId',
        as: 'sourceLanguage',
      });
    }
    if (app.model.Translation) {
      TranslationProject.hasMany(app.model.Translation, {
        foreignKey: 'projectId',
        as: 'translations',
      });
    }
    if (app.model.TranslationTask) {
      TranslationProject.hasMany(app.model.TranslationTask, {
        foreignKey: 'projectId',
        as: 'tasks',
      });
    }
  };

  return TranslationProject;
};

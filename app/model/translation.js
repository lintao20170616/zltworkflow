'use strict';

module.exports = (app) => {
  const { STRING, INTEGER, TINYINT, DATE, TEXT } = app.Sequelize;

  const Translation = app.model.define(
    'Translation',
    {
      id: {
        type: INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: '翻译ID',
      },
      projectId: {
        type: INTEGER,
        allowNull: false,
        field: 'project_id',
        comment: '项目ID',
      },
      key: {
        type: STRING(255),
        allowNull: false,
        comment: '翻译键',
      },
      sourceText: {
        type: TEXT,
        allowNull: true,
        field: 'source_text',
        comment: '源文本',
      },
      languageId: {
        type: INTEGER,
        allowNull: false,
        field: 'language_id',
        comment: '语言ID',
      },
      translatedText: {
        type: TEXT,
        allowNull: true,
        field: 'translated_text',
        comment: '翻译文本',
      },
      status: {
        type: TINYINT,
        allowNull: false,
        defaultValue: 1,
        comment: '状态：1-待翻译，2-翻译中，3-已完成',
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
      tableName: 'translations',
      timestamps: true,
      underscored: false,
      indexes: [
        {
          unique: true,
          fields: ['project_id', 'key', 'language_id'],
          name: 'uniq_project_key_language',
        },
      ],
    },
  );

  Translation.associate = function () {
    if (app.model.TranslationProject) {
      Translation.belongsTo(app.model.TranslationProject, {
        foreignKey: 'projectId',
        as: 'project',
      });
    }
    if (app.model.Language) {
      Translation.belongsTo(app.model.Language, {
        foreignKey: 'languageId',
        as: 'language',
      });
    }
  };

  return Translation;
};

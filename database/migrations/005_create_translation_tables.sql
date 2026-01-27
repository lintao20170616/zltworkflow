-- 使用数据库
USE `zltadmin`;

-- 创建翻译项目表
CREATE TABLE IF NOT EXISTS `translation_projects` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '项目ID',
  `name` VARCHAR(128) NOT NULL COMMENT '项目名称',
  `description` VARCHAR(512) DEFAULT NULL COMMENT '项目描述',
  `source_language_id` INT(11) UNSIGNED NOT NULL COMMENT '源语言ID（关联languages表）',
  `target_language_ids` JSON DEFAULT NULL COMMENT '目标语言ID列表（JSON数组）',
  `status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '状态：1-进行中，2-已完成，3-已归档',
  `created_by` INT(11) UNSIGNED DEFAULT NULL COMMENT '创建人ID（关联users表）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_source_language_id` (`source_language_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_by` (`created_by`),
  CONSTRAINT `fk_translation_projects_source_language` FOREIGN KEY (`source_language_id`) REFERENCES `languages` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='翻译项目表';

-- 创建翻译内容表
CREATE TABLE IF NOT EXISTS `translations` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '翻译ID',
  `project_id` INT(11) UNSIGNED NOT NULL COMMENT '项目ID（关联translation_projects表）',
  `key` VARCHAR(255) NOT NULL COMMENT '翻译键',
  `source_text` TEXT DEFAULT NULL COMMENT '源文本',
  `language_id` INT(11) UNSIGNED NOT NULL COMMENT '语言ID（关联languages表）',
  `translated_text` TEXT DEFAULT NULL COMMENT '翻译文本',
  `status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '状态：1-待翻译，2-翻译中，3-已完成',
  `translator_id` INT(11) UNSIGNED DEFAULT NULL COMMENT '翻译人员ID（关联users表）',
  `reviewer_id` INT(11) UNSIGNED DEFAULT NULL COMMENT '审核人员ID（关联users表）',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_project_key_language` (`project_id`, `key`, `language_id`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_language_id` (`language_id`),
  KEY `idx_status` (`status`),
  KEY `idx_translator_id` (`translator_id`),
  KEY `idx_reviewer_id` (`reviewer_id`),
  CONSTRAINT `fk_translations_project` FOREIGN KEY (`project_id`) REFERENCES `translation_projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_translations_language` FOREIGN KEY (`language_id`) REFERENCES `languages` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='翻译内容表';

-- 创建翻译任务表
CREATE TABLE IF NOT EXISTS `translation_tasks` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '任务ID',
  `project_id` INT(11) UNSIGNED NOT NULL COMMENT '项目ID（关联translation_projects表）',
  `translator_id` INT(11) UNSIGNED DEFAULT NULL COMMENT '翻译人员ID（关联users表）',
  `reviewer_id` INT(11) UNSIGNED DEFAULT NULL COMMENT '审核人员ID（关联users表）',
  `status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '状态：1-待翻译，2-翻译中，3-待审核，4-已完成，5-已取消',
  `progress` INT(11) NOT NULL DEFAULT 0 COMMENT '进度（已完成数量）',
  `total_count` INT(11) NOT NULL DEFAULT 0 COMMENT '总数量',
  `due_date` DATETIME DEFAULT NULL COMMENT '截止日期',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_translator_id` (`translator_id`),
  KEY `idx_reviewer_id` (`reviewer_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_translation_tasks_project` FOREIGN KEY (`project_id`) REFERENCES `translation_projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='翻译任务表';

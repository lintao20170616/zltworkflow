-- 使用数据库
USE `zltadmin`;

-- 扩展翻译任务表
ALTER TABLE `translation_tasks`
  ADD COLUMN `task_number` VARCHAR(50) DEFAULT NULL COMMENT '任务编号' AFTER `id`,
  ADD COLUMN `project_name` VARCHAR(255) DEFAULT NULL COMMENT '项目名称' AFTER `project_id`,
  ADD COLUMN `text_count` INT(11) NOT NULL DEFAULT 0 COMMENT '文案条数' AFTER `total_count`,
  ADD COLUMN `is_backfilled` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否回填：0-否，1-是' AFTER `text_count`;

-- 为现有任务生成任务编号（格式：TASK-YYYYMMDD-序号）
UPDATE `translation_tasks`
SET `task_number` = CONCAT('TASK-', DATE_FORMAT(`created_at`, '%Y%m%d'), '-', LPAD(`id`, 6, '0'))
WHERE `task_number` IS NULL;

-- 设置 task_number 为 NOT NULL 并添加唯一索引
ALTER TABLE `translation_tasks`
  MODIFY COLUMN `task_number` VARCHAR(50) NOT NULL COMMENT '任务编号',
  ADD UNIQUE KEY `idx_task_number` (`task_number`);

-- 为现有任务填充项目名称
UPDATE `translation_tasks` t
INNER JOIN `translation_projects` p ON t.`project_id` = p.`id`
SET t.`project_name` = p.`name`
WHERE t.`project_name` IS NULL;

-- 设置 project_name 为 NOT NULL
ALTER TABLE `translation_tasks`
  MODIFY COLUMN `project_name` VARCHAR(255) NOT NULL COMMENT '项目名称';

-- 扩展翻译内容表
ALTER TABLE `translations`
  ADD COLUMN `task_id` INT(11) UNSIGNED DEFAULT NULL COMMENT '翻译任务ID（关联translation_tasks表）' AFTER `reviewer_id`,
  ADD KEY `idx_task_id` (`task_id`),
  ADD CONSTRAINT `fk_translations_task` FOREIGN KEY (`task_id`) REFERENCES `translation_tasks` (`id`) ON DELETE SET NULL;

-- 使用数据库
USE `zltadmin`;

-- 为系统表添加外部系统相关字段
ALTER TABLE `systems`
  ADD COLUMN `is_external` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否外部系统：1-是，0-否' AFTER `status`,
  ADD COLUMN `external_url` VARCHAR(512) DEFAULT NULL COMMENT '外部系统URL（当is_external=1时使用）' AFTER `is_external`,
  ADD KEY `idx_is_external` (`is_external`);

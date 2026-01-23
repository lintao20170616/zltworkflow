-- 使用数据库
USE `zltadmin`;

-- 创建系统表
CREATE TABLE IF NOT EXISTS `systems` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '系统ID',
  `code` VARCHAR(64) NOT NULL COMMENT '系统编码',
  `name` VARCHAR(128) NOT NULL COMMENT '系统名称',
  `status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  `sort` INT(11) NOT NULL DEFAULT 0 COMMENT '排序',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_code` (`code`),
  KEY `idx_status` (`status`),
  KEY `idx_sort` (`sort`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统表';

-- 创建菜单表
CREATE TABLE IF NOT EXISTS `menus` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '菜单ID',
  `system_id` INT(11) UNSIGNED NOT NULL COMMENT '系统ID',
  `parent_id` INT(11) UNSIGNED DEFAULT NULL COMMENT '父菜单ID',
  `title` VARCHAR(128) NOT NULL COMMENT '菜单名称',
  `name` VARCHAR(64) NOT NULL COMMENT '路由名称',
  `path` VARCHAR(255) NOT NULL COMMENT '路由路径',
  `icon` VARCHAR(64) DEFAULT NULL COMMENT '图标名称',
  `component` VARCHAR(255) DEFAULT NULL COMMENT '前端组件标识/路径',
  `status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  `sort` INT(11) NOT NULL DEFAULT 0 COMMENT '排序',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_system_id` (`system_id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_status` (`status`),
  KEY `idx_sort` (`sort`),
  CONSTRAINT `fk_menus_system` FOREIGN KEY (`system_id`) REFERENCES `systems` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_menus_parent` FOREIGN KEY (`parent_id`) REFERENCES `menus` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='菜单表';


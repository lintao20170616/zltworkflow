-- 使用数据库
USE `zltadmin`;

-- 创建语言表
CREATE TABLE IF NOT EXISTS `languages` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '语言ID',
  `code` VARCHAR(16) NOT NULL COMMENT '语言代码（如：zh-CN, en-US）',
  `name` VARCHAR(64) NOT NULL COMMENT '语言名称（如：简体中文、English）',
  `native_name` VARCHAR(64) DEFAULT NULL COMMENT '本地名称',
  `flag` VARCHAR(32) DEFAULT NULL COMMENT '国旗图标标识',
  `status` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '状态：1-启用，0-禁用',
  `sort` INT(11) NOT NULL DEFAULT 0 COMMENT '排序',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_code` (`code`),
  KEY `idx_status` (`status`),
  KEY `idx_sort` (`sort`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='语言表';

-- 插入默认语言数据（如果已存在则忽略）
INSERT IGNORE INTO `languages` (`code`, `name`, `native_name`, `flag`, `status`, `sort`) VALUES
('zh-CN', '简体中文', '简体中文', 'CN', 1, 1),
('zh-TW', '繁体中文', '繁體中文', 'TW', 1, 2),
('en-US', '英语', 'English', 'US', 1, 3),
('ja-JP', '日语', '日本語', 'JP', 1, 4),
('ko-KR', '韩语', '한국어', 'KR', 1, 5),
('fr-FR', '法语', 'Français', 'FR', 1, 6),
('de-DE', '德语', 'Deutsch', 'DE', 1, 7),
('es-ES', '西班牙语', 'Español', 'ES', 1, 8),
('ru-RU', '俄语', 'Русский', 'RU', 1, 9),
('ar-SA', '阿拉伯语', 'العربية', 'SA', 1, 10);

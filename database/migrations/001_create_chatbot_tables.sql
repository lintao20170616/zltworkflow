-- 使用数据库
USE `zltadmin`;

-- 创建会话表
CREATE TABLE IF NOT EXISTS `conversations` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '会话ID',
  `user_id` INT(11) UNSIGNED NOT NULL COMMENT '用户ID',
  `title` VARCHAR(255) DEFAULT NULL COMMENT '会话标题',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_updated_at` (`updated_at`),
  CONSTRAINT `fk_conversation_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='聊天会话表';

-- 创建消息表
CREATE TABLE IF NOT EXISTS `messages` (
  `id` INT(11) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '消息ID',
  `conversation_id` INT(11) UNSIGNED NOT NULL COMMENT '会话ID',
  `role` ENUM('user', 'bot') NOT NULL COMMENT '角色：user-用户，bot-机器人',
  `content` TEXT NOT NULL COMMENT '消息内容',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_conversation_id` (`conversation_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_message_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='聊天消息表';

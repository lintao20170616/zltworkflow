-- MySQL dump 10.13  Distrib 9.4.0, for macos14.7 (arm64)
--
-- Host: localhost    Database: zltadmin
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '会话ID',
  `user_id` int unsigned NOT NULL COMMENT '用户ID',
  `title` varchar(255) DEFAULT NULL COMMENT '会话标题',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_updated_at` (`updated_at`),
  CONSTRAINT `fk_conversation_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='聊天会话表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
INSERT INTO `conversations` VALUES (11,2,'123','2026-01-27 20:41:56','2026-01-27 20:41:56');
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `languages`
--

DROP TABLE IF EXISTS `languages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `languages` (
  `id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '语言ID',
  `code` varchar(16) NOT NULL COMMENT '语言代码（如：zh-CN, en-US）',
  `name` varchar(64) NOT NULL COMMENT '语言名称（如：简体中文、English）',
  `native_name` varchar(64) DEFAULT NULL COMMENT '本地名称',
  `flag` varchar(32) DEFAULT NULL COMMENT '国旗图标标识',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态：1-启用，0-禁用',
  `sort` int NOT NULL DEFAULT '0' COMMENT '排序',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_code` (`code`),
  KEY `idx_status` (`status`),
  KEY `idx_sort` (`sort`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='语言表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `languages`
--

LOCK TABLES `languages` WRITE;
/*!40000 ALTER TABLE `languages` DISABLE KEYS */;
INSERT INTO `languages` VALUES (1,'zh-CN','简体中文','简体中文','CN',1,1,'2026-01-26 16:45:34','2026-01-26 16:45:34'),(2,'zh-TW','繁体中文','繁體中文','TW',0,2,'2026-01-26 16:45:34','2026-01-26 16:56:03'),(3,'en-US','英语','English','US',1,3,'2026-01-26 16:45:34','2026-01-26 16:45:34'),(4,'ja-JP','日语','日本語','JP',0,4,'2026-01-26 16:45:34','2026-01-26 16:56:08'),(5,'ko-KR','韩语','한국어','KR',0,5,'2026-01-26 16:45:34','2026-01-26 16:56:10'),(6,'fr-FR','法语','Français','FR',0,6,'2026-01-26 16:45:34','2026-01-26 16:56:15'),(7,'de-DE','德语','Deutsch','DE',0,7,'2026-01-26 16:45:34','2026-01-26 16:56:21'),(8,'es-ES','西班牙语','Español','ES',0,8,'2026-01-26 16:45:34','2026-01-26 16:56:24'),(9,'ru-RU','俄语','Русский','RU',0,9,'2026-01-26 16:45:34','2026-01-26 16:56:27'),(10,'ar-SA','阿拉伯语','العربية','SA',0,10,'2026-01-26 16:45:34','2026-01-26 16:56:28');
/*!40000 ALTER TABLE `languages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `menus`
--

DROP TABLE IF EXISTS `menus`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `menus` (
  `id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '菜单ID',
  `system_id` int unsigned NOT NULL COMMENT '系统ID',
  `parent_id` int unsigned DEFAULT NULL COMMENT '父菜单ID',
  `title` varchar(128) NOT NULL COMMENT '菜单名称',
  `name` varchar(64) NOT NULL COMMENT '路由名称',
  `path` varchar(255) NOT NULL COMMENT '路由路径',
  `icon` varchar(64) DEFAULT NULL COMMENT '图标名称',
  `component` varchar(255) DEFAULT NULL COMMENT '前端组件标识/路径',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态：1-启用，0-禁用',
  `sort` int NOT NULL DEFAULT '0' COMMENT '排序',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_system_id` (`system_id`),
  KEY `idx_parent_id` (`parent_id`),
  KEY `idx_status` (`status`),
  KEY `idx_sort` (`sort`),
  CONSTRAINT `fk_menus_parent` FOREIGN KEY (`parent_id`) REFERENCES `menus` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_menus_system` FOREIGN KEY (`system_id`) REFERENCES `systems` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='菜单表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `menus`
--

LOCK TABLES `menus` WRITE;
/*!40000 ALTER TABLE `menus` DISABLE KEYS */;
INSERT INTO `menus` VALUES (1,1,NULL,'系统管理','SystemManage','/system',NULL,NULL,1,1,'2026-01-23 17:28:17','2026-01-25 21:26:58'),(2,1,NULL,'用户信息管理','UserInfo','/userinfo','User',NULL,1,2,'2026-01-23 17:29:08','2026-01-25 21:27:06'),(3,1,NULL,'菜单管理','MenuManage','/menu',NULL,NULL,1,2,'2026-01-23 17:29:43','2026-01-25 21:27:02'),(4,1,NULL,'聊天机器人','ChatBot','/chatbot','ChatLineRound',NULL,1,3,'2026-01-23 17:31:22','2026-01-25 21:27:11'),(5,1,NULL,'用户列表','UserList','/userlist',NULL,NULL,1,0,'2026-01-23 17:34:02','2026-01-26 15:47:17'),(6,2,NULL,'语言管理','Language','/language',NULL,NULL,1,1,'2026-01-23 22:03:25','2026-01-23 22:03:25'),(8,2,NULL,'应用管理','Project','/projects',NULL,NULL,1,2,'2026-01-23 22:04:52','2026-01-26 18:02:43'),(10,3,NULL,'首页','Home','/home',NULL,NULL,1,0,'2026-01-26 16:34:09','2026-01-26 16:34:09'),(11,2,NULL,'翻译任务','TranslationTasks','/translation/tasks',NULL,NULL,1,3,'2026-01-27 15:45:57','2026-01-27 15:46:16');
/*!40000 ALTER TABLE `menus` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '消息ID',
  `conversation_id` int unsigned NOT NULL COMMENT '会话ID',
  `role` enum('user','bot') NOT NULL COMMENT '角色：user-用户，bot-机器人',
  `content` text NOT NULL COMMENT '消息内容',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_conversation_id` (`conversation_id`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_message_conversation` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=151 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='聊天消息表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
INSERT INTO `messages` VALUES (135,11,'user','123','2026-01-27 22:03:42'),(136,11,'bot','我理解您说的\"123\"。这是一个有趣的话题，能详细说说吗？','2026-01-27 22:03:43'),(137,11,'user','你是谁','2026-01-27 22:03:52'),(138,11,'bot','我理解您说的\"你是谁\"。这是一个有趣的话题，能详细说说吗？','2026-01-27 22:03:52'),(139,11,'user','123','2026-01-27 22:30:24'),(140,11,'bot','您好！我是由中国的深度求索（DeepSeek）公司开发的智能助手DeepSeek-R1。我是一个AI助手，主要通过网络搜索来回答问题，并且在历史上记录了问答内容。如果您有任何问题或需要帮助，请随时告诉我！','2026-01-27 22:30:49'),(141,11,'user','你好，介绍一下自己','2026-01-28 09:30:39'),(142,11,'bot','您好！我是DeepSeek-R1，很高兴认识您！😊\n\n让我简单介绍一下自己：\n\n**基本信息：**\n- 我是由深度求索（DeepSeek）公司开发的AI助手\n- 我是一个纯文本模型，专注于理解和生成自然语言\n\n**主要特点：**\n- 支持文件上传功能，可以处理图像、txt、pdf、ppt、word、excel等多种格式文件\n- 具备联网搜索能力（需要您在Web/App中手动开启搜索功能）\n- 拥有128K的上下文长度，能够处理较长的对话和文档\n- 完全免费使用，没有任何收费计划\n\n**我能为您做什么：**\n- 回答各种问题，提供信息和解释\n- 协助写作、翻译、编程等任务\n- 分析和处理您上传的文档内容\n- 进行创意讨论和头脑风暴\n\n我的知识截止到2024年7月，会以热情细腻的方式为您提供帮助。有什么问题或需要协助的地方，请随时告诉我！','2026-01-28 09:30:47'),(143,11,'user','介绍一下杨振宁','2026-01-28 09:32:06'),(144,11,'bot','杨振宁（1922年10月1日－）是享誉世界的理论物理学家，诺贝尔物理学奖得主，在粒子物理、统计力学和凝聚态物理等领域做出了里程碑式的贡献。以下是他的主要介绍：\n\n---\n\n### **1. 生平概览**\n- **出生与教育**：生于安徽合肥，1942年毕业于西南联合大学，1945年赴美留学，1948年获芝加哥大学博士学位。\n- **学术生涯**：长期任教于普林斯顿高等研究院（1949-1966）、纽约州立大学石溪分校（1966-1999），曾任香港中文大学博文讲座教授（1999年起）。\n- **晚年归国**：2003年回国定居，受聘为清华大学教授，2015年放弃美国国籍，恢复中国国籍。\n\n---\n\n### **2. 主要科学贡献**\n#### **（1）杨-米尔斯理论（Yang-Mills Theory）**\n- 与罗伯特·米尔斯（Robert Mills）于1954年提出，奠定了现代粒子物理标准模型的基础。\n- 该理论描述了基本粒子的强相互作用和弱相互作用，是统一自然界基本力的关键框架。\n- 被称为“20世纪后半叶理论物理的基石”，催生了量子色动力学（QCD）等核心理论。\n\n#### **（2）宇称不守恒（Parity Violation）**\n- 与李政道合作提出“弱相互作用中宇称不守恒”理论（1956年），颠覆了物理学界对对称性的传统认知。\n- 1957年由吴健雄通过实验证实，同年杨振宁与李政道共同获得**诺贝尔物理学奖**（首位获诺奖的华人科学家）。\n\n#### **（3）其他重要成就**\n- **杨-巴克斯特方程**：在统计力学和量子可积系统中具有深远影响。\n- **超导理论**（杨-Byers方程）：对BCS超导理论的推广。\n- **规范场论**：为粒子物理、数学（微分几何）和凝聚态物理提供了桥梁。\n\n---\n\n### **3. 学术地位与荣誉**\n- 被公认为继爱因斯坦、狄拉克之后，20世纪最具影响力的理论物理学家之一。\n- 获颁美国国家科学奖章（1986）、鲍尔奖（1994）、费萨尔国王国际奖（2001）等数十项国际大奖。\n- 2021年百岁寿辰时，中国学术界举办系列活动致敬其科学贡献。\n\n---\n\n### **4. 社会与文化影响**\n- **推动中国科学发展**：1970年代起多次回国讲学，协助创立清华大学高等研究中心，培养中国理论物理人才。\n- **科学与人文思考**：晚年关注科学哲学、教育及中美文化交流，发表多篇关于科技发展与文明反思的论述。\n- **公众形象**：因其科学成就、国籍选择及个人生活（82岁时与28岁的翁帆结婚）常引发公众讨论，但其科学贡献始终备受尊重。\n\n---\n\n### **5. 名言与思想**\n- “科学家的使命是发现自然的美，而美的标准往往是对称与简洁。”\n- 晚年强调：“中国科技发展需要自主创新，而非盲目追随西方模式。”\n\n---\n\n杨振宁的科学遗产深刻重塑了现代物理学，其理论至今仍在粒子物理、数学物理等领域持续激发新突破。他的一生跨越东西方，既是科学巨匠，也是文化桥梁。','2026-01-28 09:32:35'),(145,11,'user','你有记忆功能和学习能力吗','2026-01-28 09:34:46'),(146,11,'bot','关于我的记忆和学习能力，我来为您详细说明一下：\n\n## **记忆功能**\n- **对话记忆**：在单次对话中，我能记住我们之前的对话内容，保持上下文连贯性。但每次对话结束后，这些记忆通常不会保留到下一次对话中。\n- **长期记忆**：我没有跨对话的长期记忆能力，每次对话对我来说都是相对独立的。\n\n## **学习能力**\n- **个体学习**：我不会从与您的对话中“学习”并改变我的知识库或行为模式。我的核心知识是在训练阶段固定的（截止到2024年7月）。\n- **集体学习**：深度求索公司可能会通过用户反馈和新的训练数据来改进后续版本的模型，但这不是在对话过程中实时发生的。\n\n## **实际表现**\n- 我能根据对话上下文调整回答，提供更相关的信息\n- 我能处理您上传的文件内容，并在当前对话中记住这些信息\n- 但我不会“记住”您这个人或我们之前的对话历史\n\n## **隐私保护**\n这种设计也有隐私保护的考虑：\n- 您的对话内容不会被用来个性化训练我的特定版本\n- 每次对话都是相对独立的\n\n所以简单来说：**我有短期的对话记忆，但没有长期的个人记忆和学习能力**。如果您需要我记住某些信息，最好在当前对话中明确提及或重新提供相关信息。\n\n有什么其他问题我可以帮您解答吗？😊','2026-01-28 09:34:58'),(147,11,'user','你记得我第一个问题是啥吗','2026-01-28 09:36:50'),(148,11,'bot','根据我们当前的对话记录，您的第一个问题是询问我的身份，具体是：“介绍一下杨振宁”。不过，如果您指的是更早的对话开头（即本次对话的初始问题），由于我的记忆仅限于当前对话窗口内，而您最初的问题可能发生在更早的对话轮次中，我无法直接回溯到本次对话开始之前的内容。\n\n如果您需要我回顾本次对话中已讨论过的内容，我可以基于当前上下文协助梳理。您可以随时提醒我具体关注哪些信息！ 😊','2026-01-28 09:36:57'),(149,11,'user','deepseek-reasoner 这模型跟你有什么区别','2026-01-28 09:39:45'),(150,11,'bot','关于 **DeepSeek-Rasoner** 模型，我需要诚实地告诉您：我目前没有关于这个特定模型的详细官方信息。不过，我可以基于一般情况为您分析这类“推理专用模型”可能的特点：\n\n## **可能的区别特征**（基于行业常见模式）：\n\n### **1. 设计侧重点**\n- **我（DeepSeek最新版本）**：通用对话模型，平衡知识、对话、推理等多方面能力\n- **Reasoner模型**：可能专门针对复杂推理任务优化，如：\n  - 逻辑推理\n  - 数学问题求解\n  - 多步骤分析\n  - 代码生成与调试\n\n### **2. 能力特点**\n- **推理模型** 可能更擅长：\n  - 链式思考（Chain-of-Thought）\n  - 系统性分析\n  - 复杂问题分解\n  - 精确的逻辑推导\n\n### **3. 使用场景**\n- **我**：适合广泛对话、问答、创作、分析等综合任务\n- **Reasoner**：可能更适合需要深度推理的特定场景\n\n## **建议您**\n1. **查阅官方文档**：访问 DeepSeek 官网或技术博客获取准确信息\n2. **实际测试对比**：如果该模型已公开可用，可以亲自测试其能力特点\n3. **关注发布说明**：官方通常会详细说明不同模型的定位差异\n\n## **我的现状**\n我是 DeepSeek 的最新版本模型，具备较强的推理能力，但如果有专门的 Reasoner 模型，它可能在特定推理任务上会有更专业的表现。\n\n您是想了解某个具体的推理任务吗？我可以帮您分析一下！ 🧠','2026-01-28 09:40:02');
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '角色ID',
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '角色名称',
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '角色描述',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'admin','管理员','2026-01-20 07:07:25','2026-01-20 07:07:25'),(2,'user','普通用户','2026-01-20 07:07:25','2026-01-20 07:07:25'),(3,'guest','访客','2026-01-20 07:07:25','2026-01-20 07:07:25');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `systems`
--

DROP TABLE IF EXISTS `systems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `systems` (
  `id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '系统ID',
  `code` varchar(64) NOT NULL COMMENT '系统编码',
  `name` varchar(128) NOT NULL COMMENT '系统名称',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态：1-启用，0-禁用',
  `is_external` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否外部系统：1-是，0-否',
  `external_url` varchar(512) DEFAULT NULL COMMENT '外部系统URL（当is_external=1时使用）',
  `sort` int NOT NULL DEFAULT '0' COMMENT '排序',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_code` (`code`),
  KEY `idx_status` (`status`),
  KEY `idx_sort` (`sort`),
  KEY `idx_is_external` (`is_external`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='系统表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `systems`
--

LOCK TABLES `systems` WRITE;
/*!40000 ALTER TABLE `systems` DISABLE KEYS */;
INSERT INTO `systems` VALUES (1,'001','权限系统',1,0,NULL,1,'2026-01-23 17:25:35','2026-01-23 17:25:43'),(2,'002','翻译平台',1,0,NULL,2,'2026-01-23 22:01:14','2026-01-26 16:33:21'),(3,'003','模版系统',1,1,'http://localhost:3001',3,'2026-01-26 16:33:07','2026-01-26 16:33:07');
/*!40000 ALTER TABLE `systems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `translation_projects`
--

DROP TABLE IF EXISTS `translation_projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `translation_projects` (
  `id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '项目ID',
  `name` varchar(128) NOT NULL COMMENT '项目名称',
  `description` varchar(512) DEFAULT NULL COMMENT '项目描述',
  `source_language_id` int unsigned NOT NULL COMMENT '源语言ID（关联languages表）',
  `target_language_ids` json DEFAULT NULL COMMENT '目标语言ID列表（JSON数组）',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态：1-进行中，2-已完成，3-已归档',
  `created_by` int unsigned DEFAULT NULL COMMENT '创建人ID（关联users表）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_source_language_id` (`source_language_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_by` (`created_by`),
  CONSTRAINT `fk_translation_projects_source_language` FOREIGN KEY (`source_language_id`) REFERENCES `languages` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='翻译项目表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `translation_projects`
--

LOCK TABLES `translation_projects` WRITE;
/*!40000 ALTER TABLE `translation_projects` DISABLE KEYS */;
INSERT INTO `translation_projects` VALUES (1,'subsystem','模版系统',1,'[3, 1]',1,2,'2026-01-26 18:03:57','2026-01-26 18:03:57'),(2,'workflow','工作流系统',1,'[1, 3]',1,2,'2026-01-27 11:06:30','2026-01-27 11:06:44');
/*!40000 ALTER TABLE `translation_projects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `translation_tasks`
--

DROP TABLE IF EXISTS `translation_tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `translation_tasks` (
  `id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '任务ID',
  `task_number` varchar(50) NOT NULL COMMENT '任务编号',
  `project_id` int unsigned NOT NULL COMMENT '项目ID（关联translation_projects表）',
  `project_name` varchar(255) NOT NULL COMMENT '项目名称',
  `translator_id` int unsigned DEFAULT NULL COMMENT '翻译人员ID（关联users表）',
  `reviewer_id` int unsigned DEFAULT NULL COMMENT '审核人员ID（关联users表）',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态：1-待翻译，2-翻译中，3-待审核，4-已完成，5-已取消',
  `progress` int NOT NULL DEFAULT '0' COMMENT '进度（已完成数量）',
  `total_count` int NOT NULL DEFAULT '0' COMMENT '总数量',
  `text_count` int NOT NULL DEFAULT '0' COMMENT '文案条数',
  `is_backfilled` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否回填：0-否，1-是',
  `due_date` datetime DEFAULT NULL COMMENT '截止日期',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_task_number` (`task_number`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_translator_id` (`translator_id`),
  KEY `idx_reviewer_id` (`reviewer_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_translation_tasks_project` FOREIGN KEY (`project_id`) REFERENCES `translation_projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='翻译任务表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `translation_tasks`
--

LOCK TABLES `translation_tasks` WRITE;
/*!40000 ALTER TABLE `translation_tasks` DISABLE KEYS */;
INSERT INTO `translation_tasks` VALUES (2,'TASK-20260127-000001',2,'workflow',NULL,NULL,4,200,64,64,0,NULL,'2026-01-27 15:38:23','2026-01-27 22:37:48'),(3,'TASK-20260127-000002',2,'workflow',NULL,NULL,1,133,76,76,0,NULL,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(4,'TASK-20260127-000003',2,'workflow',NULL,NULL,1,100,2,2,0,NULL,'2026-01-27 22:33:36','2026-01-27 22:34:41');
/*!40000 ALTER TABLE `translation_tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `translations`
--

DROP TABLE IF EXISTS `translations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `translations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '翻译ID',
  `project_id` int unsigned NOT NULL COMMENT '项目ID（关联translation_projects表）',
  `key` varchar(255) NOT NULL COMMENT '翻译键',
  `source_text` text COMMENT '源文本',
  `language_id` int unsigned NOT NULL COMMENT '语言ID（关联languages表）',
  `translated_text` text COMMENT '翻译文本',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态：1-待翻译，2-翻译中，3-已完成',
  `translator_id` int unsigned DEFAULT NULL COMMENT '翻译人员ID（关联users表）',
  `reviewer_id` int unsigned DEFAULT NULL COMMENT '审核人员ID（关联users表）',
  `task_id` int unsigned DEFAULT NULL COMMENT '翻译任务ID（关联translation_tasks表）',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_project_key_language` (`project_id`,`key`,`language_id`),
  KEY `idx_project_id` (`project_id`),
  KEY `idx_language_id` (`language_id`),
  KEY `idx_status` (`status`),
  KEY `idx_translator_id` (`translator_id`),
  KEY `idx_reviewer_id` (`reviewer_id`),
  KEY `idx_task_id` (`task_id`),
  CONSTRAINT `fk_translations_language` FOREIGN KEY (`language_id`) REFERENCES `languages` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fk_translations_project` FOREIGN KEY (`project_id`) REFERENCES `translation_projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_translations_task` FOREIGN KEY (`task_id`) REFERENCES `translation_tasks` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=143 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='翻译内容表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `translations`
--

LOCK TABLES `translations` WRITE;
/*!40000 ALTER TABLE `translations` DISABLE KEYS */;
INSERT INTO `translations` VALUES (1,2,'873c8ca1-1e33-42e0-a187-242fce80ff75','语言管理',1,'语言管理',3,0,NULL,2,'2026-01-27 15:38:23','2026-01-27 17:30:39'),(2,2,'873c8ca1-1e33-42e0-a187-242fce80ff75','语言管理',3,'Language management',1,0,NULL,2,'2026-01-27 15:38:23','2026-01-28 09:53:49'),(3,2,'8e7f14b2-4384-4587-a1ac-040802996a45','搜索代码/名称',1,'搜索代码/名称',3,0,NULL,2,'2026-01-27 15:38:23','2026-01-27 17:30:39'),(4,2,'8e7f14b2-4384-4587-a1ac-040802996a45','搜索代码/名称',3,'Search code/name',1,0,NULL,2,'2026-01-27 15:38:23','2026-01-28 09:53:49'),(5,2,'cbe8d83e-f078-4198-9fd1-fa84ee420da7','状态',1,'状态',3,0,NULL,2,'2026-01-27 15:38:23','2026-01-27 17:30:39'),(6,2,'cbe8d83e-f078-4198-9fd1-fa84ee420da7','状态',3,'Status',1,0,NULL,2,'2026-01-27 15:38:23','2026-01-28 09:53:49'),(7,2,'2ae520be-0b70-4cc0-8c04-537aa0f85000','启用',1,'启用',3,0,NULL,2,'2026-01-27 15:38:23','2026-01-27 17:30:39'),(8,2,'2ae520be-0b70-4cc0-8c04-537aa0f85000','启用',3,'Enable',1,0,NULL,2,'2026-01-27 15:38:23','2026-01-28 09:53:49'),(9,2,'f38634ce-98d2-46bb-953b-53a27e621c34','禁用',1,'禁用',3,0,NULL,2,'2026-01-27 15:38:23','2026-01-27 17:30:39'),(10,2,'f38634ce-98d2-46bb-953b-53a27e621c34','禁用',3,'Disable',1,0,NULL,2,'2026-01-27 15:38:23','2026-01-28 09:53:49'),(11,2,'caa55d18-ff0a-4e48-a3a0-975de493bd23','新增语言',1,'新增语言',3,0,NULL,2,'2026-01-27 15:38:23','2026-01-27 17:30:39'),(12,2,'caa55d18-ff0a-4e48-a3a0-975de493bd23','新增语言',3,'Add language',1,0,NULL,2,'2026-01-27 15:38:23','2026-01-28 09:53:49'),(13,2,'d8be2c1e-b0ef-4e01-83fe-0bfdcd2bbf85','刷新',1,'刷新',3,0,NULL,2,'2026-01-27 15:38:23','2026-01-27 17:30:39'),(14,2,'d8be2c1e-b0ef-4e01-83fe-0bfdcd2bbf85','刷新',3,'Refresh',1,0,NULL,2,'2026-01-27 15:38:23','2026-01-28 09:53:49'),(15,2,'5d2b5349-47d2-4644-bb84-0dcaa9def89d','语言代码',1,'语言代码',3,0,NULL,2,'2026-01-27 15:38:23','2026-01-27 17:30:39'),(16,2,'5d2b5349-47d2-4644-bb84-0dcaa9def89d','语言代码',3,'Search code/name',1,0,NULL,2,'2026-01-27 15:38:23','2026-01-28 09:53:49'),(17,2,'70c6ef03-76b3-4788-bc14-9313500561ef','语言名称',1,'语言名称',3,0,NULL,2,'2026-01-27 15:38:23','2026-01-27 17:30:39'),(18,2,'70c6ef03-76b3-4788-bc14-9313500561ef','语言名称',3,'Enter the language code',1,0,NULL,2,'2026-01-27 15:38:23','2026-01-28 09:53:49'),(19,2,'6abaf5a1-1984-42d7-b1b6-6e567f1f7361','本地名称',1,'本地名称',3,0,NULL,2,'2026-01-27 15:38:23','2026-01-27 17:30:39'),(20,2,'6abaf5a1-1984-42d7-b1b6-6e567f1f7361','本地名称',3,'Enter the language name',1,0,NULL,2,'2026-01-27 15:38:23','2026-01-28 09:53:49'),(21,2,'a0003ad4-161c-4a06-aca8-76a3ad163295','图标',1,'图标',3,0,NULL,2,'2026-01-27 15:38:23','2026-01-27 17:30:39'),(22,2,'a0003ad4-161c-4a06-aca8-76a3ad163295','图标',3,'Failed to load language list',1,0,NULL,2,'2026-01-27 15:38:23','2026-01-28 09:53:49'),(23,2,'08654ed5-8b1a-4139-9482-01a4007d67d7','排序',1,'排序',3,0,NULL,2,'2026-01-27 15:38:23','2026-01-27 17:30:39'),(24,2,'08654ed5-8b1a-4139-9482-01a4007d67d7','排序',3,'Language loaded successfully',1,0,NULL,2,'2026-01-27 15:38:23','2026-01-28 09:53:49'),(25,2,'3cb2c796-3c23-4c12-aab7-cf765635831e','更新时间',1,'更新时间',3,0,NULL,2,'2026-01-27 15:38:23','2026-01-27 17:30:39'),(26,2,'3cb2c796-3c23-4c12-aab7-cf765635831e','更新时间',3,'Create success',1,0,NULL,2,'2026-01-27 15:38:23','2026-01-28 09:53:49'),(27,2,'911e5e04-5296-4fc1-8851-32dcc356eb98','操作',1,'操作',3,0,NULL,2,'2026-01-27 15:38:23','2026-01-27 17:30:39'),(28,2,'911e5e04-5296-4fc1-8851-32dcc356eb98','操作',3,'Update success',1,0,NULL,2,'2026-01-27 15:38:23','2026-01-28 09:53:49'),(29,2,'f462aae9-180a-4826-9876-eebc2139f9ea','编辑',1,'编辑',3,0,NULL,2,'2026-01-27 15:38:23','2026-01-27 17:30:39'),(30,2,'f462aae9-180a-4826-9876-eebc2139f9ea','编辑',3,'Hint',1,0,NULL,2,'2026-01-27 15:38:23','2026-01-28 09:53:49'),(31,2,'d9d6230e-5033-4f12-8ff3-846bd907d5ee','删除',1,'删除',3,0,NULL,2,'2026-01-27 15:38:23','2026-01-27 17:30:39'),(32,2,'d9d6230e-5033-4f12-8ff3-846bd907d5ee','删除',3,'Delete',1,0,NULL,2,'2026-01-27 15:38:23','2026-01-28 09:53:49'),(33,2,'611744cf-c0d5-4a9c-a453-6bf589c53083','编辑语言',1,'编辑语言',3,0,NULL,2,'2026-01-27 15:38:23','2026-01-27 17:30:39'),(34,2,'611744cf-c0d5-4a9c-a453-6bf589c53083','编辑语言',3,'Failed to update language list',1,0,NULL,2,'2026-01-27 15:38:23','2026-01-28 09:53:49'),(35,2,'1782853a-4b48-4235-8022-fd02005a7b83','如：zh-CN, en-US',1,'如：zh-CN, en-US',3,0,NULL,2,'2026-01-27 15:38:23','2026-01-27 17:30:39'),(36,2,'1782853a-4b48-4235-8022-fd02005a7b83','如：zh-CN, en-US',3,'Enter the language code',1,0,NULL,2,'2026-01-27 15:38:23','2026-01-28 09:53:49'),(37,2,'c6c19c50-d26f-4e57-bb51-b4321ac8c81d','如：简体中文、English',1,'如：简体中文、English',3,0,NULL,2,'2026-01-27 15:38:23','2026-01-27 17:30:39'),(38,2,'c6c19c50-d26f-4e57-bb51-b4321ac8c81d','如：简体中文、English',3,'Enter the language name',1,0,NULL,2,'2026-01-27 15:38:23','2026-01-28 09:53:49'),(39,2,'4a15d11d-bffa-464a-8caf-488f9c1bc58e','图标标识',1,'图标标识',3,0,NULL,2,'2026-01-27 15:38:23','2026-01-27 17:30:39'),(40,2,'4a15d11d-bffa-464a-8caf-488f9c1bc58e','图标标识',3,'Failed to load language list',1,0,NULL,2,'2026-01-27 15:38:23','2026-01-28 09:53:49'),(41,2,'497620ff-c206-4bf1-9b3d-4e44ebb3ff6a','如：CN, US',1,'如：CN, US',3,0,NULL,2,'2026-01-27 15:38:23','2026-01-27 17:30:39'),(42,2,'497620ff-c206-4bf1-9b3d-4e44ebb3ff6a','如：CN, US',3,'Language loaded successfully',1,0,NULL,2,'2026-01-27 15:38:23','2026-01-28 09:53:49'),(43,2,'c93acce8-ff71-48b0-989e-8d027bdc1706','取消',1,'取消',3,0,NULL,2,'2026-01-27 15:38:23','2026-01-27 17:30:39'),(44,2,'c93acce8-ff71-48b0-989e-8d027bdc1706','取消',3,'Create success',1,0,NULL,2,'2026-01-27 15:38:23','2026-01-28 09:53:49'),(45,2,'6587979b-371f-4abb-bbf1-157b42755b94','保存',1,'保存',3,0,NULL,2,'2026-01-27 15:38:23','2026-01-27 17:30:39'),(46,2,'6587979b-371f-4abb-bbf1-157b42755b94','保存',3,'Update success',1,0,NULL,2,'2026-01-27 15:38:23','2026-01-28 09:53:49'),(47,2,'af472459-0f42-4cd5-8e00-7b24c0575721','请输入语言代码',1,'请输入语言代码',3,0,NULL,2,'2026-01-27 15:38:23','2026-01-27 17:30:39'),(48,2,'af472459-0f42-4cd5-8e00-7b24c0575721','请输入语言代码',3,'Hint',1,0,NULL,2,'2026-01-27 15:38:23','2026-01-28 09:53:49'),(49,2,'778b94b2-ce4f-4f73-9526-777a57bb126b','请输入语言名称',1,'请输入语言名称',3,0,NULL,2,'2026-01-27 15:38:23','2026-01-27 17:30:39'),(50,2,'778b94b2-ce4f-4f73-9526-777a57bb126b','请输入语言名称',3,'Delete operation completed successfully',1,0,NULL,2,'2026-01-27 15:38:23','2026-01-28 09:53:49'),(51,2,'e2a8255f-4e04-4b66-837b-5ff9a88f747c','加载语言列表失败',1,'加载语言列表失败',3,0,NULL,2,'2026-01-27 15:38:23','2026-01-27 17:30:39'),(52,2,'e2a8255f-4e04-4b66-837b-5ff9a88f747c','加载语言列表失败',3,'Failed to update language list',1,0,NULL,2,'2026-01-27 15:38:23','2026-01-28 09:53:49'),(53,2,'9b43836c-7740-43ac-ad81-0b555ce763b3','创建成功',1,'创建成功',3,0,NULL,2,'2026-01-27 15:38:23','2026-01-27 17:30:39'),(54,2,'9b43836c-7740-43ac-ad81-0b555ce763b3','创建成功',3,'Language updated successfully',1,0,NULL,2,'2026-01-27 15:38:23','2026-01-28 09:53:49'),(55,2,'2adfca68-25f8-4c89-aa79-1ccd560170a4','更新成功',1,'更新成功',3,0,NULL,2,'2026-01-27 15:38:23','2026-01-27 17:30:39'),(56,2,'2adfca68-25f8-4c89-aa79-1ccd560170a4','更新成功',3,'Failed to load language list',1,0,NULL,2,'2026-01-27 15:38:23','2026-01-28 09:53:49'),(57,2,'ebb6d803-ef17-4130-baf7-360e58d04502','提示',1,'提示',3,0,NULL,2,'2026-01-27 15:38:23','2026-01-27 17:30:39'),(58,2,'ebb6d803-ef17-4130-baf7-360e58d04502','提示',3,'Create success',1,0,NULL,2,'2026-01-27 15:38:23','2026-01-28 09:53:49'),(59,2,'26cff2ba-a4ee-429f-9629-f20f79a05a88','删除成功',1,'删除成功',3,0,NULL,2,'2026-01-27 15:38:23','2026-01-27 17:30:39'),(60,2,'26cff2ba-a4ee-429f-9629-f20f79a05a88','删除成功',3,'Update success',1,0,NULL,2,'2026-01-27 15:38:23','2026-01-28 09:53:49'),(61,2,'61b113c4-bbe2-4aef-b7a7-4233bd2896f4','状态已更新',1,'状态已更新',3,0,NULL,2,'2026-01-27 15:38:23','2026-01-27 17:30:39'),(62,2,'61b113c4-bbe2-4aef-b7a7-4233bd2896f4','状态已更新',3,'Hint',1,0,NULL,2,'2026-01-27 15:38:23','2026-01-28 09:53:49'),(63,2,'4e718d78-69e4-4288-8f1a-70508554a32b','更新状态失败',1,'更新状态失败',3,0,NULL,2,'2026-01-27 15:38:23','2026-01-27 17:30:39'),(64,2,'4e718d78-69e4-4288-8f1a-70508554a32b','更新状态失败',3,'Failed to update language list',1,0,NULL,2,'2026-01-27 15:38:23','2026-01-28 09:53:49'),(65,2,'cc470f6f-1d25-4dd3-9387-86687f912eb2','返回列表',1,'返回列表',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-27 17:47:39'),(66,2,'cc470f6f-1d25-4dd3-9387-86687f912eb2','返回列表',3,'Return to List',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(67,2,'1dd43fd2-9f64-4f92-8489-478ce711e6e6','批量AI翻译',1,'批量AI翻译',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-27 17:47:39'),(68,2,'1dd43fd2-9f64-4f92-8489-478ce711e6e6','批量AI翻译',3,'Batch AI Translation',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(69,2,'a127eb8c-6054-4d04-99e3-bbdb77a2c3f1','回填翻译结果',1,'回填翻译结果',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-27 17:47:39'),(70,2,'a127eb8c-6054-4d04-99e3-bbdb77a2c3f1','回填翻译结果',3,'Backfill Translation Results',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(71,2,'cec0f59f-efb1-4e1a-bbe5-db39902b5dc1','任务编号',1,'任务编号',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(72,2,'cec0f59f-efb1-4e1a-bbe5-db39902b5dc1','任务编号',3,'Task ID',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(73,2,'cdeac254-87f9-4430-b451-89a7b966c625','项目名称',1,'项目名称',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(74,2,'cdeac254-87f9-4430-b451-89a7b966c625','项目名称',3,'Project Name',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(75,2,'620a363c-add3-4950-aaa7-13497274d16f','文案条数',1,'文案条数',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-27 17:47:39'),(76,2,'620a363c-add3-4950-aaa7-13497274d16f','文案条数',3,'Number of Copy Items',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(77,2,'d557a200-4cbf-42c6-ae67-2b8f31dc3c3c','是否回填',1,'是否回填',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-27 17:47:39'),(78,2,'d557a200-4cbf-42c6-ae67-2b8f31dc3c3c','是否回填',3,'Backfilled?',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(79,2,'ca736300-d718-47d8-b7b5-b743efb6da29','已回填',1,'已回填',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-27 17:47:39'),(80,2,'ca736300-d718-47d8-b7b5-b743efb6da29','已回填',3,'Backfilled',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(81,2,'ed8eacfe-612c-41bf-9b55-c1c1b6868c51','未回填',1,'未回填',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-27 17:47:39'),(82,2,'ed8eacfe-612c-41bf-9b55-c1c1b6868c51','未回填',3,'Not Backfilled',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(83,2,'ff61f19f-283f-43ca-847b-ec39a7cd3991','进度',1,'进度',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-27 17:47:39'),(84,2,'ff61f19f-283f-43ca-847b-ec39a7cd3991','进度',3,'Progress',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(85,2,'d1e0538c-fda4-47a0-9824-7ff61a7bc911','创建时间',1,'创建时间',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-27 17:47:39'),(86,2,'d1e0538c-fda4-47a0-9824-7ff61a7bc911','创建时间',3,'Creation Time',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(87,2,'c53229f0-ede5-465e-99f4-d3a1c1d2e189','翻译记录列表',1,'翻译记录列表',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-27 17:47:39'),(88,2,'c53229f0-ede5-465e-99f4-d3a1c1d2e189','翻译记录列表',3,'Translation Record List',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(89,2,'82755c82-e1ae-44d4-989b-3f1ab7db310f','翻译键',1,'翻译键',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-27 17:47:39'),(90,2,'82755c82-e1ae-44d4-989b-3f1ab7db310f','翻译键',3,'Translation Key',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(91,2,'d6eb5d01-3c3f-4d81-bd5f-64f0f13d670e','源文本',1,'源文本',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-27 17:47:39'),(92,2,'d6eb5d01-3c3f-4d81-bd5f-64f0f13d670e','源文本',3,'Source Text',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(93,2,'dd7d838d-16bf-40ca-a085-84f7116af4a9','翻译文本',1,'翻译文本',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-27 17:47:39'),(94,2,'dd7d838d-16bf-40ca-a085-84f7116af4a9','翻译文本',3,'Translated Text',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(95,2,'fc2ff2d5-1e06-46fb-8be2-c32821f16254','未翻译',1,'未翻译',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-27 17:47:39'),(96,2,'fc2ff2d5-1e06-46fb-8be2-c32821f16254','未翻译',3,'Not Translated',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(97,2,'82e9ac1e-e2d2-4be8-9762-e5d8749e89fc','暂无翻译记录',1,'暂无翻译记录',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-27 17:47:39'),(98,2,'82e9ac1e-e2d2-4be8-9762-e5d8749e89fc','暂无翻译记录',3,'No Translation Records Yet',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(99,2,'c7cfbeca-ed48-48ee-9d10-d52e2bd4405d','待翻译',1,'待翻译',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-27 17:47:39'),(100,2,'c7cfbeca-ed48-48ee-9d10-d52e2bd4405d','待翻译',3,'Pending Translation',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(101,2,'098526c7-e659-4bfa-ab71-70fb5a7690a0','翻译中',1,'翻译中',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-27 17:47:39'),(102,2,'098526c7-e659-4bfa-ab71-70fb5a7690a0','翻译中',3,'Translating',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(103,2,'897a5fc2-9b1e-4ef7-8e69-4d56ec5a6e3d','待审核',1,'待审核',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-27 17:47:39'),(104,2,'897a5fc2-9b1e-4ef7-8e69-4d56ec5a6e3d','待审核',3,'Pending Review',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(105,2,'c5f60a62-3ff9-4e7d-9d7b-08f757d2596b','已完成',1,'已完成',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-27 17:47:39'),(106,2,'c5f60a62-3ff9-4e7d-9d7b-08f757d2596b','已完成',3,'Completed',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(107,2,'f94303bc-0061-46d7-a689-539034d9e080','已取消',1,'已取消',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(108,2,'f94303bc-0061-46d7-a689-539034d9e080','已取消',3,'Cancelled',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(109,2,'05732545-d44f-4080-9c48-1b1b56778466','未知',1,'未知',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(110,2,'05732545-d44f-4080-9c48-1b1b56778466','未知',3,'Unknown',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(111,2,'24fcd212-40c5-4d7c-84bd-a79e60b7e037','加载任务详情失败',1,'加载任务详情失败',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(112,2,'24fcd212-40c5-4d7c-84bd-a79e60b7e037','加载任务详情失败',3,'Failed to Load Task Details',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(113,2,'65bcc19f-95ea-4acd-bf02-0a6e6f346f14','加载翻译列表失败',1,'加载翻译列表失败',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(114,2,'65bcc19f-95ea-4acd-bf02-0a6e6f346f14','加载翻译列表失败',3,'Failed to Load Translation List',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(115,2,'eca7b880-9f12-4ca2-9861-34268328828e','确认使用AI批量翻译该任务下的所有待翻译内容？',1,'确认使用AI批量翻译该任务下的所有待翻译内容？',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(116,2,'eca7b880-9f12-4ca2-9861-34268328828e','确认使用AI批量翻译该任务下的所有待翻译内容？',3,'Confirm using AI to batch translate all pending content in this task?',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(117,2,'d45801f2-8d18-4e09-bcd9-a9185a406eb0','批量AI翻译失败',1,'批量AI翻译失败',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(118,2,'d45801f2-8d18-4e09-bcd9-a9185a406eb0','批量AI翻译失败',3,'Batch AI Translation Failed',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(119,2,'f42582f9-bfb1-4595-b754-d65bd4b0a37c','确认回填翻译结果到语言文件？',1,'确认回填翻译结果到语言文件？',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(120,2,'f42582f9-bfb1-4595-b754-d65bd4b0a37c','确认回填翻译结果到语言文件？',3,'Confirm backfilling translation results to language files?',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(121,2,'2eda7647-e6a4-422a-a589-977a034e84eb','回填失败',1,'回填失败',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(122,2,'2eda7647-e6a4-422a-a589-977a034e84eb','回填失败',3,'Backfill Failed',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(123,2,'f7d842ec-68fb-488d-be18-4bf8a1469e85','翻译任务管理',1,'翻译任务管理',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(124,2,'f7d842ec-68fb-488d-be18-4bf8a1469e85','翻译任务管理',3,'Translation Task Management',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(125,2,'818567c5-3cfa-48df-ac8c-93c05495e667','新增任务',1,'新增任务',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(126,2,'818567c5-3cfa-48df-ac8c-93c05495e667','新增任务',3,'Add New Task',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(127,2,'847894c3-b358-44a5-8858-d5ac3fa5908b','查看详情',1,'查看详情',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(128,2,'847894c3-b358-44a5-8858-d5ac3fa5908b','查看详情',3,'View Details',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(129,2,'a9219903-e2eb-4628-a7d3-de192f09cb63','编辑任务',1,'编辑任务',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(130,2,'a9219903-e2eb-4628-a7d3-de192f09cb63','编辑任务',3,'Edit Task',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(131,2,'8feabadf-8023-4ba1-8943-1708fc9f6abf','项目',1,'项目',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(132,2,'8feabadf-8023-4ba1-8943-1708fc9f6abf','项目',3,'Project',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(133,2,'59c52cf6-6c22-4139-8737-d62c82cef685','请选择项目',1,'请选择项目',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(134,2,'59c52cf6-6c22-4139-8737-d62c82cef685','请选择项目',3,'Please select a project',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(135,2,'5a0dfd3d-c88e-4ba8-9ee9-f68d8cec2824','请选择状态',1,'请选择状态',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(136,2,'5a0dfd3d-c88e-4ba8-9ee9-f68d8cec2824','请选择状态',3,'Please select a status',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(137,2,'239ccd74-2bae-4a2f-a9ef-513511b2a2f3','加载项目列表失败',1,'加载项目列表失败',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(138,2,'239ccd74-2bae-4a2f-a9ef-513511b2a2f3','加载项目列表失败',3,'Failed to Load Project List',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(139,2,'063f75b2-f867-400e-92d0-c3d9d53d7d20','加载任务列表失败',1,'加载任务列表失败',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(140,2,'063f75b2-f867-400e-92d0-c3d9d53d7d20','加载任务列表失败',3,'Failed to Load Task List',3,0,NULL,3,'2026-01-27 17:45:16','2026-01-28 09:55:00'),(141,2,'c614e110-b5bf-45e3-a105-00e65da454ea','菜单管理',1,'菜单管理',1,0,NULL,4,'2026-01-27 22:33:36','2026-01-28 09:53:27'),(142,2,'c614e110-b5bf-45e3-a105-00e65da454ea','菜单管理',3,'Menu Management',1,0,NULL,4,'2026-01-27 22:33:36','2026-01-28 09:53:49');
/*!40000 ALTER TABLE `translations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '用户角色ID',
  `user_id` int unsigned NOT NULL COMMENT '用户ID',
  `role_id` int unsigned NOT NULL COMMENT '角色ID',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_role` (`user_id`,`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户角色关联表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_roles`
--

LOCK TABLES `user_roles` WRITE;
/*!40000 ALTER TABLE `user_roles` DISABLE KEYS */;
INSERT INTO `user_roles` VALUES (1,1,2,'2026-01-20 07:07:25','2026-01-20 07:07:25'),(2,1,3,'2026-01-20 07:07:25','2026-01-20 07:07:25');
/*!40000 ALTER TABLE `user_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户名',
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '密码（bcrypt加密）',
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '邮箱',
  `status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态：1-启用，0-禁用',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_username` (`username`),
  KEY `idx_email` (`email`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2a$10$YourBcryptHashHere','admin@example.com',1,'2026-01-20 07:07:25','2026-01-20 07:07:25'),(2,'lintao','$2a$10$sus0FriG9A71Qszl6bVPeeIyg.fPDQoHZ2jt0DAwfgkqS7tnuGKoC','0182973@qwe.com',1,'2026-01-20 07:11:18','2026-01-20 07:11:18');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-28 10:16:28

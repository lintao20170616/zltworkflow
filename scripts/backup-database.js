/**
 * 数据库备份脚本 (Node.js 版本)
 * 使用方法: node scripts/backup-database.js
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// 从配置文件读取数据库信息
const appInfo = {
  baseDir: path.join(__dirname, '..'),
  name: 'zltworkflow',
};
const config = require('../config/config.default.js')(appInfo);
const dbConfig = config.sequelize;

// 环境变量覆盖配置
const MYSQL_HOST = process.env.MYSQL_HOST || dbConfig.host;
const MYSQL_PORT = process.env.MYSQL_PORT || dbConfig.port;
const MYSQL_USER = process.env.MYSQL_USER || dbConfig.username;
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || dbConfig.password;
const DATABASE_NAME = process.env.DATABASE_NAME || dbConfig.database;

// 备份目录
const BACKUP_DIR = path.join(__dirname, '..', 'database');
const TIMESTAMP = new Date().toISOString().replace(/[-:]/g, '').split('.')[0].replace('T', '_');
const BACKUP_FILE = path.join(BACKUP_DIR, `${DATABASE_NAME}_${TIMESTAMP}.sql`);

// 创建备份目录（如果不存在）
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// 构建 mysqldump 命令
const passwordArg = MYSQL_PASSWORD ? `-p${MYSQL_PASSWORD}` : '';
const mysqldumpCmd = `mysqldump -h${MYSQL_HOST} -P${MYSQL_PORT} -u${MYSQL_USER} ${passwordArg} ${DATABASE_NAME} > "${BACKUP_FILE}"`;

console.log('开始备份数据库:', DATABASE_NAME);
console.log('备份文件:', BACKUP_FILE);
console.log('执行命令:', mysqldumpCmd.replace(passwordArg, passwordArg ? '-p***' : ''));

exec(mysqldumpCmd, (error, stdout, stderr) => {
  if (error) {
    console.error('备份失败:', error);
    process.exit(1);
  }

  if (stderr && !stderr.includes('Warning')) {
    console.error('警告:', stderr);
  }

  // 检查备份文件是否存在且有内容
  if (fs.existsSync(BACKUP_FILE)) {
    const stats = fs.statSync(BACKUP_FILE);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log('备份成功!');
    console.log('备份文件大小:', fileSizeInMB, 'MB');
    console.log('备份文件路径:', BACKUP_FILE);
  } else {
    console.error('备份文件未生成!');
    process.exit(1);
  }
});

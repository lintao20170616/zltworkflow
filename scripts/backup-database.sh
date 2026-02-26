#!/bin/bash

# 数据库备份脚本
# 使用方法: ./scripts/backup-database.sh

# 从配置文件读取数据库信息（优先使用环境变量）
MYSQL_HOST=${MYSQL_HOST:-127.0.0.1}
MYSQL_PORT=${MYSQL_PORT:-3306}
MYSQL_USER=${MYSQL_USER:-root}
MYSQL_PASSWORD=${MYSQL_PASSWORD:-}
DATABASE_NAME=${DATABASE_NAME:-zltadmin}

# 备份目录
BACKUP_DIR="./database"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/${DATABASE_NAME}_${TIMESTAMP}.sql"

# 创建备份目录（如果不存在）
mkdir -p "${BACKUP_DIR}"

# 构建 mysqldump 命令
if [ -z "$MYSQL_PASSWORD" ]; then
  MYSQL_CMD="mysqldump -h${MYSQL_HOST} -P${MYSQL_PORT} -u${MYSQL_USER}"
else
  MYSQL_CMD="mysqldump -h${MYSQL_HOST} -P${MYSQL_PORT} -u${MYSQL_USER} -p${MYSQL_PASSWORD}"
fi

# 执行备份
echo "开始备份数据库: ${DATABASE_NAME}"
echo "备份文件: ${BACKUP_FILE}"

${MYSQL_CMD} ${DATABASE_NAME} > "${BACKUP_FILE}"

if [ $? -eq 0 ]; then
  # 压缩备份文件（可选）
  gzip -f "${BACKUP_FILE}"
  BACKUP_FILE="${BACKUP_FILE}.gz"
  echo "备份成功: ${BACKUP_FILE}"
  
  # 显示备份文件大小
  FILE_SIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
  echo "备份文件大小: ${FILE_SIZE}"
else
  echo "备份失败！"
  exit 1
fi

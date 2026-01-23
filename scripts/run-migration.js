const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const config = {
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: process.env.DB_PASSWORD || '',
  database: 'zltadmin',
  multipleStatements: true,
};

const MIGRATIONS_DIR = path.join(__dirname, '../database/migrations');

const getMigrationFiles = () => {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    throw new Error(`迁移目录不存在: ${MIGRATIONS_DIR}`);
  }

  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((fileName) => fileName.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b));
};

const executeSqlFile = async (connection, sqlFilePath) => {
  if (!fs.existsSync(sqlFilePath)) {
    throw new Error(`SQL 文件不存在: ${sqlFilePath}`);
  }

  const sql = fs.readFileSync(sqlFilePath, 'utf8');
  const lines = sql.split('\n');

  let currentStatement = '';
  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('--')) {
      continue;
    }

    currentStatement += line + '\n';

    if (trimmed.endsWith(';')) {
      const statement = currentStatement.trim();
      if (statement) {
        try {
          await connection.query(statement);
          console.log(`✅ 执行: ${statement.substring(0, 50)}...`);
        } catch (error) {
          if (error.code !== 'ER_TABLE_EXISTS_ERROR') {
            throw error;
          }
          console.log(`⚠️  表已存在，跳过: ${statement.substring(0, 50)}...`);
        }
      }
      currentStatement = '';
    }
  }
};

async function runMigration() {
  let connection;
  try {
    console.log('正在连接数据库...');
    connection = await mysql.createConnection(config);
    console.log('✅ 数据库连接成功');

    const migrationFiles = getMigrationFiles();
    if (migrationFiles.length === 0) {
      console.log('⚠️  未找到任何迁移脚本（.sql），跳过执行');
      return;
    }

    console.log(`发现迁移脚本 ${migrationFiles.length} 个，开始按顺序执行...`);

    for (const fileName of migrationFiles) {
      const filePath = path.join(MIGRATIONS_DIR, fileName);
      console.log(`\n正在执行: ${fileName}`);
      await executeSqlFile(connection, filePath);
    }

    console.log('✅ 迁移脚本执行成功！');

    console.log('\n验证表是否创建成功...');
    const [systemsTable] = await connection.query("SHOW TABLES LIKE 'systems'");
    const [menusTable] = await connection.query("SHOW TABLES LIKE 'menus'");

    if (systemsTable.length > 0) {
      console.log('✅ systems 表已创建');
    } else {
      console.log('❌ systems 表未创建');
    }

    if (menusTable.length > 0) {
      console.log('✅ menus 表已创建');
    } else {
      console.log('❌ menus 表未创建');
    }
  } catch (error) {
    console.error('❌ 执行迁移失败:', error.message);
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n提示: 数据库访问被拒绝，请检查用户名和密码');
      console.error('可以通过环境变量设置密码: DB_PASSWORD=your_password node scripts/run-migration.js');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n提示: 无法连接到 MySQL 服务器，请确保 MySQL 服务正在运行');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.error('\n提示: 数据库不存在，请先创建 zltadmin 数据库');
      console.error('执行: CREATE DATABASE zltadmin;');
    } else if (error.code === 'ER_NO_SUCH_TABLE') {
      console.error('\n提示: users 表不存在，请先创建用户表');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n数据库连接已关闭');
    }
  }
}

runMigration();

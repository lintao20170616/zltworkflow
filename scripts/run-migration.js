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

async function runMigration() {
  let connection;
  try {
    console.log('正在连接数据库...');
    connection = await mysql.createConnection(config);
    console.log('✅ 数据库连接成功');

    const sqlFile = path.join(__dirname, '../database/migrations/001_create_chatbot_tables.sql');

    if (!fs.existsSync(sqlFile)) {
      throw new Error(`SQL 文件不存在: ${sqlFile}`);
    }

    const sql = fs.readFileSync(sqlFile, 'utf8');
    console.log('正在执行迁移脚本...');

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

    console.log('✅ 迁移脚本执行成功！');

    console.log('\n验证表是否创建成功...');
    const [conversationsTable] = await connection.query("SHOW TABLES LIKE 'conversations'");
    const [messagesTable] = await connection.query("SHOW TABLES LIKE 'messages'");

    if (conversationsTable.length > 0) {
      console.log('✅ conversations 表已创建');
      const [columns] = await connection.query('DESCRIBE conversations');
      console.log('   表结构:', columns.map((c) => c.Field).join(', '));
    } else {
      console.log('❌ conversations 表未创建');
    }

    if (messagesTable.length > 0) {
      console.log('✅ messages 表已创建');
      const [columns] = await connection.query('DESCRIBE messages');
      console.log('   表结构:', columns.map((c) => c.Field).join(', '));
    } else {
      console.log('❌ messages 表未创建');
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

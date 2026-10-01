/**
 * SQLite 数据库连接管理（单例模式）
 * 使用 better-sqlite3 同步 API，提供数据库实例的单例访问
 */
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 数据库文件路径（可通过环境变量覆盖）
// 使用 process.cwd() 拼接绝对路径，避免相对路径在不同工作目录下失效
const DB_PATH = process.env.POETRY_DB_PATH || path.resolve(process.cwd(), 'data/poetry.db');

let dbInstance = null;

/**
 * 获取数据库单例实例
 * @returns {Database.Database} better-sqlite3 数据库实例
 */
export function getDb() {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH);
    // 启用 WAL 模式提升并发读性能
    dbInstance.pragma('journal_mode = WAL');
    // 关闭外键检查以提升写入性能（数据导入时由脚本控制）
    dbInstance.pragma('foreign_keys = ON');
  }
  return dbInstance;
}

/**
 * 关闭数据库连接（用于测试或优雅退出）
 */
export function closeDb() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

/**
 * 获取数据库文件路径（供脚本使用）
 */
export function getDbPath() {
  return DB_PATH;
}

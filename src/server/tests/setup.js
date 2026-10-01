/**
 * 测试公共配置
 * 检测数据库存在性，导出 app 实例供各测试文件使用
 */
import { existsSync } from 'fs';
import path from 'path';
import app from '../app.js';

// 检测数据库文件是否存在
const DB_PATH = path.resolve(process.cwd(), 'data/poetry.db');
const dbExists = existsSync(DB_PATH);

if (!dbExists) {
  console.warn('[Test] 数据库文件不存在，部分测试将被跳过');
  console.warn(`[Test] 期望路径: ${DB_PATH}`);
}

export { app, dbExists, DB_PATH };

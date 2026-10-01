/**
 * authors 表数据访问层
 * 负责作者相关的 SQL 查询执行
 */
import { getDb } from '../db/database.js';

/**
 * 查询作者列表（可按朝代筛选）
 * @param {string} [dynasty] - 朝代名称（可选）
 * @returns {Array} 作者列表
 */
export function findAuthors(dynasty) {
  const db = getDb();

  let sql = `
    SELECT a.id, a.name, d.name AS dynasty, a.poem_count AS poemCount
    FROM authors a
    JOIN dynasties d ON a.dynasty_id = d.id
  `;

  const params = {};
  if (dynasty) {
    sql += ' WHERE d.name = @dynasty';
    params.dynasty = dynasty;
  }

  sql += ' ORDER BY a.poem_count DESC';

  return db.prepare(sql).all(params);
}

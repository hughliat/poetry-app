/**
 * dynasties 表数据访问层
 * 负责朝代相关的 SQL 查询执行
 */
import { getDb } from '../db/database.js';

/**
 * 查询所有朝代（含各朝代诗词数量）
 * @returns {Array} 朝代列表，按 sort_order 排序
 */
export function findAllDynasties() {
  const db = getDb();
  const sql = `
    SELECT d.id, d.name,
           (SELECT COUNT(*) FROM poems p WHERE p.dynasty_id = d.id) AS poemCount
    FROM dynasties d
    ORDER BY d.sort_order ASC
  `;
  return db.prepare(sql).all();
}

/**
 * 根据名称查询朝代
 * @param {string} name - 朝代名称
 * @returns {Object|undefined}
 */
export function findDynastyByName(name) {
  const db = getDb();
  return db.prepare('SELECT * FROM dynasties WHERE name = @name').get({ name });
}

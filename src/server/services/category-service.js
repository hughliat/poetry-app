/**
 * 分类业务逻辑层
 * 负责从 poems 表提取去重分类列表
 */
import { getDb } from '../db/database.js';

/**
 * 获取所有分类列表（诗体/词牌）
 * 从 poems 表的 category 字段去重提取，按 source 字段粗略区分类型
 * @returns {Array} 分类列表
 */
export function getCategoryList() {
  const db = getDb();

  // 按分类名称去重，根据 source 字段判断类型
  const sql = `
    SELECT DISTINCT p.category AS name,
           CASE
             WHEN p.source IN ('tangshi', 'tang') THEN '诗体'
             WHEN p.source IN ('songci', 'song') THEN '词牌'
             ELSE '其他'
           END AS type
    FROM poems p
    WHERE p.category != ''
    ORDER BY type, name
  `;

  return db.prepare(sql).all();
}

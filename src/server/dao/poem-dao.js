/**
 * poems 表数据访问层
 * 负责诗词相关的 SQL 查询执行
 */
import { getDb } from '../db/database.js';

/**
 * 查询诗词列表（带分页与筛选）
 * @param {Object} params - 查询参数
 * @param {number} params.pageSize - 每页数量
 * @param {number} params.offset - 偏移量
 * @param {string} [params.dynasty] - 朝代名称
 * @param {string} [params.author] - 作者姓名
 * @param {string} [params.category] - 分类名称
 * @returns {{ list: Array, total: number }}
 */
export function findPoems({ pageSize, offset, dynasty, author, category }) {
  const db = getDb();

  // 动态构建 WHERE 条件
  const conditions = [];
  const params = {};

  if (dynasty) {
    conditions.push('d.name = @dynasty');
    params.dynasty = dynasty;
  }
  if (author) {
    conditions.push('a.name = @author');
    params.author = author;
  }
  if (category) {
    conditions.push('p.category = @category');
    params.category = category;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // 查询列表数据
  const listSql = `
    SELECT p.id, p.title, a.name AS author, d.name AS dynasty,
           p.category, SUBSTR(p.content, 1, 60) AS summary
    FROM poems p
    JOIN authors a ON p.author_id = a.id
    JOIN dynasties d ON p.dynasty_id = d.id
    ${whereClause}
    ORDER BY p.title ASC
    LIMIT @pageSize OFFSET @offset
  `;

  // 查询总数
  const countSql = `
    SELECT COUNT(*) AS total
    FROM poems p
    JOIN authors a ON p.author_id = a.id
    JOIN dynasties d ON p.dynasty_id = d.id
    ${whereClause}
  `;

  params.pageSize = pageSize;
  params.offset = offset;

  const list = db.prepare(listSql).all(params);
  const { total } = db.prepare(countSql).get(params);

  return { list, total };
}

/**
 * 根据 ID 查询诗词详情
 * @param {string} id - 诗词 ID
 * @returns {Object|undefined} 诗词详情或 undefined
 */
export function findPoemById(id) {
  const db = getDb();
  const sql = `
    SELECT p.id, p.title, a.name AS author, d.name AS dynasty,
           p.category, p.content, p.annotation
    FROM poems p
    JOIN authors a ON p.author_id = a.id
    JOIN dynasties d ON p.dynasty_id = d.id
    WHERE p.id = @id
  `;
  return db.prepare(sql).get({ id });
}

/**
 * 通过 rowid 随机获取一首诗词（性能优化方案）
 * 先获取总数，生成随机偏移，再通过 rowid 定位
 * @returns {Object|undefined}
 */
export function findRandomPoem() {
  const db = getDb();

  // 获取总记录数
  const { cnt } = db.prepare('SELECT COUNT(*) AS cnt FROM poems').get();
  if (cnt === 0) return undefined;

  // 生成随机 rowid 偏移（SQLite rowid 从 1 开始）
  const randomRowid = Math.floor(Math.random() * cnt) + 1;

  const sql = `
    SELECT p.id, p.title, a.name AS author, d.name AS dynasty,
           p.category, p.content
    FROM poems p
    JOIN authors a ON p.author_id = a.id
    JOIN dynasties d ON p.dynasty_id = d.id
    WHERE p.rowid = @randomRowid
    LIMIT 1
  `;

  let result = db.prepare(sql).get({ randomRowid });

  // 如果 rowid 不连续导致未命中，回退到邻近查询
  if (!result) {
    result = db.prepare(`
      SELECT p.id, p.title, a.name AS author, d.name AS dynasty,
             p.category, p.content
      FROM poems p
      JOIN authors a ON p.author_id = a.id
      JOIN dynasties d ON p.dynasty_id = d.id
      WHERE p.rowid >= @randomRowid
      ORDER BY p.rowid ASC
      LIMIT 1
    `).get({ randomRowid });
  }

  // 最终兜底：如果仍然没有（极端情况），使用 ORDER BY RANDOM
  if (!result) {
    result = db.prepare(`
      SELECT p.id, p.title, a.name AS author, d.name AS dynasty,
             p.category, p.content
      FROM poems p
      JOIN authors a ON p.author_id = a.id
      JOIN dynasties d ON p.dynasty_id = d.id
      ORDER BY RANDOM()
      LIMIT 1
    `).get();
  }

  return result;
}

/**
 * FTS5 全文搜索诗词
 * @param {string} ftsQuery - FTS5 格式的查询字符串
 * @param {number} pageSize - 每页数量
 * @param {number} offset - 偏移量
 * @returns {{ list: Array, total: number }}
 */
export function searchPoems(ftsQuery, pageSize, offset) {
  const db = getDb();

  // 搜索列表
  const listSql = `
    SELECT f.poem_id AS id, f.title, f.author,
           SUBSTR(f.content, 1, 80) AS summary,
           rank
    FROM poem_fts f
    WHERE poem_fts MATCH @ftsQuery
    ORDER BY rank
    LIMIT @pageSize OFFSET @offset
  `;

  // 搜索总数
  const countSql = `
    SELECT COUNT(*) AS total
    FROM poem_fts f
    WHERE poem_fts MATCH @ftsQuery
  `;

  const params = { ftsQuery, pageSize, offset };
  const list = db.prepare(listSql).all(params);
  const { total } = db.prepare(countSql).get(params);

  return { list, total };
}

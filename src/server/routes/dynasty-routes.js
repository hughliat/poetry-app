/**
 * /api/dynasties 路由定义
 */
import { Router } from 'express';
import { getDb } from '../db/database.js';

const router = Router();

/**
 * GET /api/dynasties — 获取朝代列表（含各朝代诗词数量）
 */
router.get('/', (req, res, next) => {
  try {
    const db = getDb();
    const dynasties = db.prepare(`
      SELECT d.id, d.name,
             (SELECT COUNT(*) FROM poems p WHERE p.dynasty_id = d.id) AS poemCount
      FROM dynasties d
      ORDER BY d.sort_order ASC
    `).all();
    res.json({ code: 0, data: dynasties });
  } catch (err) {
    next(err);
  }
});

export default router;

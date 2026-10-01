/**
 * /api/authors 路由定义
 */
import { Router } from 'express';
import * as authorService from '../services/author-service.js';

const router = Router();

/**
 * GET /api/authors — 获取作者列表（可按朝代筛选）
 */
router.get('/', (req, res, next) => {
  try {
    const authors = authorService.getAuthorList(req.query);
    res.json({ code: 0, data: authors });
  } catch (err) {
    next(err);
  }
});

export default router;

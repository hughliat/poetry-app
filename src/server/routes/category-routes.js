/**
 * /api/categories 路由定义
 */
import { Router } from 'express';
import * as categoryService from '../services/category-service.js';

const router = Router();

/**
 * GET /api/categories — 获取分类列表（诗体/词牌）
 */
router.get('/', (req, res, next) => {
  try {
    const categories = categoryService.getCategoryList();
    res.json({ code: 0, data: categories });
  } catch (err) {
    next(err);
  }
});

export default router;

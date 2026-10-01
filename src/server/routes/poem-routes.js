/**
 * /api/poems 路由定义
 * 负责接收请求、参数校验、调用业务层、格式化响应
 */
import { Router } from 'express';
import * as poemService from '../services/poem-service.js';

const router = Router();

/**
 * GET /api/poems/search — 关键词搜索
 * 注意：此路由必须定义在 /:id 之前，避免被参数路由拦截
 */
router.get('/search', (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || !q.trim()) {
      return res.status(400).json({ code: 400, message: '搜索关键词不能为空' });
    }
    const result = poemService.searchPoems(req.query);
    res.json({ code: 0, data: result });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/poems/random — 随机获取一首诗词
 */
router.get('/random', (req, res, next) => {
  try {
    const poem = poemService.getRandomPoem();
    if (!poem) {
      return res.status(404).json({ code: 404, message: '暂无诗词数据，请先执行数据初始化' });
    }
    res.json({ code: 0, data: poem });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/poems — 获取诗词列表（带分页与筛选）
 */
router.get('/', (req, res, next) => {
  try {
    // 参数校验
    const { page, pageSize } = req.query;
    if (page !== undefined && (isNaN(parseInt(page)) || parseInt(page) < 1)) {
      return res.status(400).json({ code: 400, message: 'page 必须为正整数' });
    }
    if (pageSize !== undefined && (isNaN(parseInt(pageSize)) || parseInt(pageSize) < 1 || parseInt(pageSize) > 100)) {
      return res.status(400).json({ code: 400, message: 'pageSize 范围为 [1, 100]' });
    }

    const result = poemService.getPoemList(req.query);
    res.json({ code: 0, data: result });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/poems/:id — 获取诗词详情
 */
router.get('/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const poem = poemService.getPoemDetail(id);
    if (!poem) {
      return res.status(404).json({ code: 404, message: `未找到该诗词，ID: ${id}` });
    }
    res.json({ code: 0, data: poem });
  } catch (err) {
    next(err);
  }
});

export default router;

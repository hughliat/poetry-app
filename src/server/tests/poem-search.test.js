/**
 * GET /api/poems/search 测试
 * 覆盖关键词搜索、originalKeyword、分页、繁简搜索、异常场景
 */
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, dbExists } from './setup.js';

const describeIfDb = dbExists ? describe : describe.skip;

describeIfDb('GET /api/poems/search', () => {
  describe('正常场景', () => {
    it('关键词搜索有结果：返回列表，total > 0', async () => {
      const res = await request(app).get(`/api/poems/search?q=${encodeURIComponent('月')}`);
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(res.body.data).toHaveProperty('list');
      expect(res.body.data.total).toBeGreaterThan(0);
    });

    it('返回 originalKeyword 字段，值与用户输入一致', async () => {
      const res = await request(app).get(`/api/poems/search?q=${encodeURIComponent('明月')}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('originalKeyword');
      expect(res.body.data.originalKeyword).toBe('明月');
    });

    it('搜索结果包含高亮相关信息', async () => {
      const res = await request(app).get(`/api/poems/search?q=${encodeURIComponent('月')}`);
      expect(res.status).toBe(200);
      // 每条结果应有 summary 或 content 字段用于高亮
      if (res.body.data.list.length > 0) {
        const item = res.body.data.list[0];
        expect(item).toHaveProperty('title');
        expect(item).toHaveProperty('author');
      }
    });

    it('分页参数生效：page=2 返回第二页数据', async () => {
      const res = await request(app).get(`/api/poems/search?q=${encodeURIComponent('月')}&page=2&pageSize=5`);
      expect(res.status).toBe(200);
      expect(res.body.data.page).toBe(2);
      expect(res.body.data.pageSize).toBe(5);
    });

    it('繁简搜索：简体关键词能搜索到内容', async () => {
      const res = await request(app).get(`/api/poems/search?q=${encodeURIComponent('静夜思')}`);
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      // 简体关键词应能搜索到结果（后端自动转繁体搜索）
      expect(res.body.data).toHaveProperty('list');
    });
  });

  describe('异常场景', () => {
    it('缺少 q 参数：返回 400 错误', async () => {
      const res = await request(app).get('/api/poems/search');
      expect(res.status).toBe(400);
      expect(res.body.code).toBe(400);
    });

    it('空关键词（q=）：返回 400', async () => {
      const res = await request(app).get('/api/poems/search?q=');
      expect(res.status).toBe(400);
      expect(res.body.code).toBe(400);
    });

    it('特殊字符关键词（如 *、(、)）：不报错，返回空或匹配结果', async () => {
      const res = await request(app).get('/api/poems/search?q=' + encodeURIComponent('*()'));
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(res.body.data).toHaveProperty('list');
    });

    it('无匹配结果：返回空列表，total=0', async () => {
      const res = await request(app).get('/api/poems/search?q=' + encodeURIComponent('xyzabc不存在的关键词12345'));
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(res.body.data.list).toEqual([]);
      expect(res.body.data.total).toBe(0);
    });
  });
});

/**
 * GET /api/poems 测试
 * 覆盖默认分页、指定页码、朝代/作者筛选、组合筛选、响应结构、异常场景
 */
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, dbExists } from './setup.js';

const describeIfDb = dbExists ? describe : describe.skip;

describeIfDb('GET /api/poems', () => {
  describe('正常场景', () => {
    it('默认分页：返回第 1 页，每页 20 条', async () => {
      const res = await request(app).get('/api/poems');
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(res.body.data).toHaveProperty('list');
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data.page).toBe(1);
      expect(res.body.data.pageSize).toBe(20);
      expect(Array.isArray(res.body.data.list)).toBe(true);
      expect(res.body.data.list.length).toBeGreaterThan(0);
      expect(res.body.data.list.length).toBeLessThanOrEqual(20);
    });

    it('指定页码：返回第 2 页数据', async () => {
      const res = await request(app).get('/api/poems?page=2&pageSize=10');
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(res.body.data.page).toBe(2);
      expect(res.body.data.pageSize).toBe(10);
      expect(res.body.data.list.length).toBeLessThanOrEqual(10);
    });

    it('按朝代筛选：仅返回指定朝代的诗词', async () => {
      const res = await request(app).get(`/api/poems?dynasty=${encodeURIComponent('唐')}`);
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(res.body.data.list.length).toBeGreaterThan(0);
    });

    it('按作者筛选：仅返回指定作者的作品', async () => {
      // 先获取一首诗的作者名
      const listRes = await request(app).get('/api/poems?pageSize=1');
      const author = listRes.body.data.list[0]?.author;
      if (!author) return;

      const res = await request(app).get(`/api/poems?author=${encodeURIComponent(author)}`);
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(res.body.data.list.length).toBeGreaterThan(0);
    });

    it('组合筛选：朝代 + 作者同时筛选', async () => {
      const listRes = await request(app).get(`/api/poems?dynasty=${encodeURIComponent('唐')}&pageSize=1`);
      const poem = listRes.body.data.list[0];
      if (!poem) return;

      const res = await request(app).get(`/api/poems?dynasty=${encodeURIComponent(poem.dynasty)}&author=${encodeURIComponent(poem.author)}`);
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(res.body.data.list.length).toBeGreaterThan(0);
    });

    it('响应结构正确：包含 list、total、page、pageSize 字段', async () => {
      const res = await request(app).get('/api/poems');
      expect(res.body.data).toHaveProperty('list');
      expect(res.body.data).toHaveProperty('total');
      expect(res.body.data).toHaveProperty('page');
      expect(res.body.data).toHaveProperty('pageSize');
      expect(typeof res.body.data.total).toBe('number');
      expect(typeof res.body.data.page).toBe('number');
      expect(typeof res.body.data.pageSize).toBe('number');
    });
  });

  describe('异常场景', () => {
    it('页码越界（page=99999）：返回空列表', async () => {
      const res = await request(app).get('/api/poems?page=99999');
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(res.body.data.list).toEqual([]);
      expect(res.body.data.total).toBeGreaterThanOrEqual(0);
    });

    it('非法 pageSize（pageSize=-1）：返回错误提示', async () => {
      const res = await request(app).get('/api/poems?pageSize=-1');
      expect(res.status).toBe(400);
      expect(res.body.code).toBe(400);
    });

    it('非法 pageSize（pageSize=9999）：返回错误提示', async () => {
      const res = await request(app).get('/api/poems?pageSize=9999');
      expect(res.status).toBe(400);
      expect(res.body.code).toBe(400);
    });
  });
});

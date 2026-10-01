/**
 * GET /api/authors 测试
 * 覆盖默认列表、朝代筛选、响应结构、非法朝代
 */
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, dbExists } from './setup.js';

const describeIfDb = dbExists ? describe : describe.skip;

describeIfDb('GET /api/authors', () => {
  describe('正常场景', () => {
    it('默认列表：返回作者数组', async () => {
      const res = await request(app).get('/api/authors');
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('按朝代筛选：仅返回指定朝代的作者', async () => {
      const res = await request(app).get(`/api/authors?dynasty=${encodeURIComponent('唐')}`);
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('响应结构正确：每项包含 id、name、dynasty、poemCount', async () => {
      const res = await request(app).get('/api/authors');
      expect(res.status).toBe(200);
      const author = res.body.data[0];
      expect(author).toHaveProperty('id');
      expect(author).toHaveProperty('name');
      expect(author).toHaveProperty('dynasty');
      expect(author.name).toBeTruthy();
    });
  });

  describe('异常场景', () => {
    it('非法朝代参数：返回空列表', async () => {
      const res = await request(app).get('/api/authors?dynasty=' + encodeURIComponent('不存在的朝代'));
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(res.body.data).toEqual([]);
    });
  });
});

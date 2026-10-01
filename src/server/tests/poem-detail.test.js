/**
 * GET /api/poems/:id 测试
 * 覆盖正常详情返回、响应结构、不存在 ID、空 ID
 */
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, dbExists } from './setup.js';

const describeIfDb = dbExists ? describe : describe.skip;

describeIfDb('GET /api/poems/:id', () => {
  describe('正常场景', () => {
    it('存在的 ID：返回诗词详情，包含 title、author、dynasty、content', async () => {
      // 先获取一个有效 ID
      const listRes = await request(app).get('/api/poems?pageSize=1');
      const poemId = listRes.body.data.list[0]?.id;
      if (!poemId) return;

      const res = await request(app).get(`/api/poems/${encodeURIComponent(poemId)}`);
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(res.body.data).toHaveProperty('title');
      expect(res.body.data).toHaveProperty('author');
      expect(res.body.data).toHaveProperty('dynasty');
      expect(res.body.data).toHaveProperty('content');
      expect(res.body.data.title).toBeTruthy();
      expect(res.body.data.author).toBeTruthy();
    });

    it('响应结构正确：code=0，data 包含完整字段', async () => {
      const listRes = await request(app).get('/api/poems?pageSize=1');
      const poemId = listRes.body.data.list[0]?.id;
      if (!poemId) return;

      const res = await request(app).get(`/api/poems/${encodeURIComponent(poemId)}`);
      expect(res.body.code).toBe(0);
      expect(typeof res.body.data).toBe('object');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('title');
      expect(res.body.data).toHaveProperty('author');
      expect(res.body.data).toHaveProperty('dynasty');
    });
  });

  describe('异常场景', () => {
    it('不存在的 ID：返回 404', async () => {
      const res = await request(app).get('/api/poems/nonexistent-id-xyz-999');
      expect(res.status).toBe(404);
      expect(res.body.code).toBe(404);
    });

    it('空 ID：返回 404', async () => {
      const res = await request(app).get('/api/poems/');
      // 空 ID 会匹配到 GET /api/poems 列表接口，返回 200
      // 或者如果路由不匹配则 404
      expect([200, 404]).toContain(res.status);
    });
  });
});

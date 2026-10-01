/**
 * GET /api/poems/random 测试
 * 覆盖随机诗词结构、连续性概率测试、响应 code
 */
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, dbExists } from './setup.js';

const describeIfDb = dbExists ? describe : describe.skip;

describeIfDb('GET /api/poems/random', () => {
  describe('正常场景', () => {
    it('返回随机诗词，结构包含 id、title、author、content', async () => {
      const res = await request(app).get('/api/poems/random');
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('title');
      expect(res.body.data).toHaveProperty('author');
      expect(res.body.data.title).toBeTruthy();
      expect(res.body.data.author).toBeTruthy();
    });

    it('连续调用 5 次，至少返回 2 首不同诗词（概率测试）', async () => {
      const results = [];
      for (let i = 0; i < 5; i++) {
        const res = await request(app).get('/api/poems/random');
        expect(res.status).toBe(200);
        results.push(res.body.data.id);
      }
      const uniqueIds = new Set(results);
      expect(uniqueIds.size).toBeGreaterThanOrEqual(2);
    });

    it('响应 code=0', async () => {
      const res = await request(app).get('/api/poems/random');
      expect(res.body.code).toBe(0);
    });
  });
});

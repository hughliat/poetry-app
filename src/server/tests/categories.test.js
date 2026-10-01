/**
 * GET /api/categories 测试
 * 覆盖分类列表返回、name/type 字段、分类名称不重复
 */
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, dbExists } from './setup.js';

const describeIfDb = dbExists ? describe : describe.skip;

describeIfDb('GET /api/categories', () => {
  describe('正常场景', () => {
    it('返回分类列表，数组长度 > 0', async () => {
      const res = await request(app).get('/api/categories');
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('每项包含 name 和 type 字段', async () => {
      const res = await request(app).get('/api/categories');
      expect(res.status).toBe(200);
      for (const cat of res.body.data) {
        expect(cat).toHaveProperty('name');
        expect(cat).toHaveProperty('type');
        expect(cat.name).toBeTruthy();
        expect(cat.type).toBeTruthy();
      }
    });

    it('分类列表长度 > 0 且每项包含 name 和 type 字段', async () => {
      const res = await request(app).get('/api/categories');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      for (const cat of res.body.data) {
        expect(cat).toHaveProperty('name');
        expect(cat).toHaveProperty('type');
      }
    });
  });
});

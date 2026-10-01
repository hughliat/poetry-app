/**
 * GET /api/dynasties 测试
 * 覆盖朝代列表返回、poemCount 字段、排序
 */
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app, dbExists } from './setup.js';

const describeIfDb = dbExists ? describe : describe.skip;

describeIfDb('GET /api/dynasties', () => {
  describe('正常场景', () => {
    it('返回朝代列表，至少包含唐、宋', async () => {
      const res = await request(app).get('/api/dynasties');
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(0);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);

      const names = res.body.data.map(d => d.name);
      expect(names).toContain('唐');
      expect(names).toContain('宋');
    });

    it('每项包含 poemCount 字段，值 > 0', async () => {
      const res = await request(app).get('/api/dynasties');
      expect(res.status).toBe(200);
      for (const dynasty of res.body.data) {
        expect(dynasty).toHaveProperty('poemCount');
        expect(dynasty.poemCount).toBeGreaterThan(0);
      }
    });

    it('按 sort_order 排序', async () => {
      const res = await request(app).get('/api/dynasties');
      expect(res.status).toBe(200);
      // 唐应在宋前面（sort_order 升序）
      const names = res.body.data.map(d => d.name);
      const tangIdx = names.indexOf('唐');
      const songIdx = names.indexOf('宋');
      expect(tangIdx).toBeLessThan(songIdx);
    });
  });
});

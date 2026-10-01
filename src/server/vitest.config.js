/**
 * Vitest 测试配置
 */
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.js'],
    testTimeout: 10000,    // 单用例超时 10s（考虑数据库 IO）
    hookTimeout: 10000,
  },
});

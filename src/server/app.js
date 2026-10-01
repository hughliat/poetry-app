/**
 * Express 应用创建与中间件配置
 * 诗词 Web 应用后端入口
 */
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// 导入路由
import poemRoutes from './routes/poem-routes.js';
import authorRoutes from './routes/author-routes.js';
import dynastyRoutes from './routes/dynasty-routes.js';
import categoryRoutes from './routes/category-routes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// ========== 中间件配置 ==========

// 跨域支持（允许前端开发服务器跨域请求）
app.use(cors());

// JSON 请求体解析
app.use(express.json());

// 生产模式下服务前端构建产物
const distPath = path.resolve(__dirname, '../client/dist');
app.use(express.static(distPath));

// ========== API 路由注册 ==========

app.use('/api/poems', poemRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/dynasties', dynastyRoutes);
app.use('/api/categories', categoryRoutes);

// ========== 错误处理中间件 ==========

// 统一错误处理，返回 { code, message } 格式
app.use((err, req, res, _next) => {
  console.error('[Server Error]', err.message || err);
  const code = err.statusCode || 500;
  res.status(code).json({
    code,
    message: err.message || '服务器内部错误',
  });
});

// ========== 导出 app 实例 ==========
// listen() 已分离到 start.js，此处仅导出 app 供测试和启动使用

export default app;

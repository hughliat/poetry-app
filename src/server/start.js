/**
 * 后端启动文件（从 app.js 分离 listen）
 * app.js 仅负责创建和导出 app 实例，此文件负责启动 HTTP 监听
 */
import app from './app.js';

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`诗词应用后端已启动: http://localhost:${PORT}`);
  console.log(`API 地址: http://localhost:${PORT}/api/`);
});

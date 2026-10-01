/**
 * Vue 应用创建与挂载
 * 诗词 Web 应用前端入口
 */
import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index.js';

// 引入全局样式（顺序重要：变量 → 重置 → 基础 → 响应式）
import './styles/variables.css';
import './styles/reset.css';
import './styles/base.css';
import './styles/responsive.css';

const app = createApp(App);
app.use(router);
app.mount('#app');

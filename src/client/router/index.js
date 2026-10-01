/**
 * Vue Router 路由配置
 * 路由懒加载，按需加载页面组件
 */
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/home-view.vue'),
  },
  {
    path: '/browse',
    name: 'Browse',
    component: () => import('../views/browse-view.vue'),
  },
  {
    path: '/search',
    name: 'Search',
    component: () => import('../views/search-view.vue'),
    // 搜索关键词通过 query 参数传递：/search?q=明月
  },
  {
    path: '/poem/:id',
    name: 'PoemDetail',
    component: () => import('../views/poem-detail-view.vue'),
    // 诗词 ID 通过路由参数传递
  },
  {
    // 【二期新增】收藏列表页
    path: '/favorites',
    name: 'Favorites',
    component: () => import('../views/favorites-view.vue'),
  },
  {
    path: '/:pathMatch(.*)*', // 404 兜底
    name: 'NotFound',
    component: () => import('../views/home-view.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  // 路由切换时滚动到顶部
  scrollBehavior() {
    return { top: 0 };
  },
});

export default router;

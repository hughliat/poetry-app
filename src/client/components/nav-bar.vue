<template>
  <header class="nav-bar">
    <div class="nav-bar__inner container">
      <!-- Logo / 站名 -->
      <router-link to="/" class="nav-bar__brand">
        <span class="nav-bar__logo">诗</span>
        <span class="nav-bar__name">诗词天地</span>
      </router-link>

      <!-- 导航链接（桌面端） -->
      <nav class="nav-bar__links">
        <router-link to="/" class="nav-link" exact-active-class="active">首页</router-link>
        <router-link to="/browse" class="nav-link" active-class="active">浏览</router-link>
        <router-link to="/search" class="nav-link" active-class="active">搜索</router-link>
        <router-link to="/favorites" class="nav-link" active-class="active">我的收藏</router-link>
      </nav>

      <!-- 搜索框（桌面端） -->
      <div class="nav-bar__search">
        <input
          type="text"
          class="nav-bar__input"
          placeholder="搜索诗词、作者..."
          v-model="keyword"
          @keyup.enter="doSearch"
        />
        <button class="nav-bar__search-btn" @click="doSearch">&#128269;</button>
      </div>

      <!-- 右侧操作区：繁简切换 + 收藏入口 -->
      <div class="nav-bar__actions">
        <button class="nav-bar__mode-btn" @click="toggleScriptMode" :title="isTraditional ? '切换为简体' : '切换为繁体'">
          {{ isTraditional ? '简' : '繁' }}
        </button>
        <router-link to="/favorites" class="nav-bar__fav-btn" title="我的收藏">
          ♥
        </router-link>
      </div>

      <!-- 汉堡菜单按钮（仅移动端可见） -->
      <button class="nav-bar__hamburger" @click="menuOpen = !menuOpen" aria-label="菜单">
        <span class="hamburger-icon"></span>
      </button>
    </div>

    <!-- 侧边抽屉菜单（移动端） -->
    <div v-if="menuOpen" class="mobile-menu__overlay" @click="menuOpen = false"></div>
    <div class="mobile-menu" :class="{ open: menuOpen }">
      <nav class="mobile-menu__links">
        <router-link to="/" @click="menuOpen = false">首页</router-link>
        <router-link to="/browse" @click="menuOpen = false">浏览</router-link>
        <router-link to="/search" @click="menuOpen = false">搜索</router-link>
        <router-link to="/favorites" @click="menuOpen = false">我的收藏</router-link>
      </nav>
    </div>
  </header>
</template>

<script setup>
/**
 * 顶部导航栏组件
 * 包含站名、导航链接、搜索框、繁简切换按钮、收藏入口、汉堡菜单
 */
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useScriptMode } from '../composables/useScriptMode.js';

const router = useRouter();
const keyword = ref('');
const menuOpen = ref(false);

const { isTraditional, toggleScriptMode } = useScriptMode();

/** 执行搜索，跳转到搜索页 */
function doSearch() {
  const q = keyword.value.trim();
  if (q) {
    router.push({ name: 'Search', query: { q } });
  }
}
</script>

<style scoped>
.nav-bar {
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border);
  height: var(--nav-height);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 4px rgba(58, 46, 46, 0.06);
}

.nav-bar__inner {
  display: flex;
  align-items: center;
  height: 100%;
  gap: var(--spacing-lg);
}

.nav-bar__brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-shrink: 0;
}

.nav-bar__logo {
  width: 36px;
  height: 36px;
  background: var(--color-primary);
  color: #fff;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-serif);
  font-size: 1.2rem;
  font-weight: 700;
}

.nav-bar__name {
  font-family: var(--font-serif);
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--color-primary);
}

.nav-bar__links {
  display: flex;
  gap: var(--spacing-md);
}

.nav-link {
  font-size: 0.95rem;
  color: var(--color-text);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}
.nav-link:hover {
  color: var(--color-primary);
}
.nav-link.active {
  color: var(--color-primary);
  font-weight: 500;
}

.nav-bar__search {
  display: flex;
  align-items: center;
  margin-left: auto;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: 0 var(--spacing-sm);
  transition: border-color 0.2s;
}
.nav-bar__search:focus-within {
  border-color: var(--color-primary);
}

.nav-bar__input {
  width: 200px;
  padding: var(--spacing-sm) var(--spacing-xs);
  font-size: 0.9rem;
  background: transparent;
}
.nav-bar__input::placeholder {
  color: var(--color-text-light);
}

.nav-bar__search-btn {
  padding: var(--spacing-xs);
  font-size: 1rem;
  opacity: 0.6;
  transition: opacity 0.2s;
}
.nav-bar__search-btn:hover {
  opacity: 1;
}

/* 右侧操作区 */
.nav-bar__actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-left: auto;
}

.nav-bar__mode-btn {
  padding: 4px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  color: var(--color-text);
  background: var(--color-bg-card);
  cursor: pointer;
  transition: all 0.2s;
  min-width: 36px;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.nav-bar__mode-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.nav-bar__fav-btn {
  font-size: 1.1rem;
  color: #c0392b;
  text-decoration: none;
  padding: 4px 8px;
  transition: opacity 0.2s;
}
.nav-bar__fav-btn:hover {
  opacity: 0.7;
}

/* 汉堡菜单按钮 */
.nav-bar__hamburger {
  display: none; /* 桌面端隐藏 */
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: none;
  background: transparent;
  cursor: pointer;
  padding: 0;
}

.hamburger-icon {
  display: block;
  width: 22px;
  height: 2px;
  background: var(--color-text);
  position: relative;
  transition: background 0.2s;
}
.hamburger-icon::before,
.hamburger-icon::after {
  content: '';
  position: absolute;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--color-text);
  transition: transform 0.2s;
}
.hamburger-icon::before { top: -7px; }
.hamburger-icon::after { bottom: -7px; }

/* 侧边抽屉菜单 */
.mobile-menu {
  position: fixed;
  top: 0;
  right: 0;
  width: 280px;
  height: 100%;
  background: var(--color-bg-card);
  z-index: 200;
  transform: translateX(100%);
  transition: transform 0.3s ease;
  padding: var(--spacing-lg);
  padding-top: calc(var(--nav-height) + var(--spacing-lg));
}
.mobile-menu.open { transform: translateX(0); }

.mobile-menu__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 199;
}

.mobile-menu__links {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}
.mobile-menu__links a {
  font-size: 1.1rem;
  color: var(--color-text);
  padding: var(--spacing-md);
  border-radius: var(--radius-sm);
  text-decoration: none;
  transition: all 0.2s;
}
.mobile-menu__links a:hover {
  background: rgba(139, 69, 19, 0.05);
  color: var(--color-primary);
}
</style>

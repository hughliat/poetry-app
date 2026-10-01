<template>
  <div class="favorites-view container">
    <h1 class="favorites-view__title">我的收藏</h1>

    <!-- 收藏列表 -->
    <div v-if="favoriteList.length > 0" class="favorites-view__list">
      <div
        v-for="item in favoriteList"
        :key="item.id"
        class="favorite-item"
      >
        <div class="favorite-item__info" @click="goToDetail(item.id)">
          <h3 class="favorite-item__title">{{ convertText(item.title) }}</h3>
          <p class="favorite-item__meta">
            <span>{{ convertText(item.author) }}</span>
            <span class="favorite-item__dynasty">{{ item.dynasty }}</span>
            <span class="favorite-item__time">{{ formatTime(item.addedAt) }}</span>
          </p>
        </div>
        <button
          class="favorite-item__remove"
          @click="handleRemove(item.id)"
          title="取消收藏"
        >
          ♥
        </button>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="favorites-view__empty">
      <p>还没有收藏的诗词，去发现喜欢的作品吧</p>
      <router-link to="/browse" class="btn btn-primary">去浏览</router-link>
    </div>
  </div>
</template>

<script setup>
/**
 * 收藏列表页面
 * 展示所有已收藏诗词，支持取消收藏操作
 */
import { useRouter } from 'vue-router';
import { useFavorites } from '../composables/useFavorites.js';
import { useScriptMode } from '../composables/useScriptMode.js';

const router = useRouter();
const { favoriteList, removeFavorite } = useFavorites();
const { convertText } = useScriptMode();

/** 跳转到诗词详情 */
function goToDetail(id) {
  router.push({ name: 'PoemDetail', params: { id } });
}

/** 取消收藏 */
function handleRemove(id) {
  removeFavorite(id);
}

/**
 * 格式化收藏时间为相对时间
 * @param {string} isoStr - ISO 8601 时间字符串
 * @returns {string} 相对时间描述
 */
function formatTime(isoStr) {
  const date = new Date(isoStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return '刚刚';
  if (diffMin < 60) return `${diffMin} 分钟前`;
  if (diffHour < 24) return `${diffHour} 小时前`;
  if (diffDay < 30) return `${diffDay} 天前`;

  // 超过 30 天显示绝对日期
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
</script>

<style scoped>
.favorites-view {
  padding-top: var(--spacing-lg);
  padding-bottom: var(--spacing-xl);
  max-width: 700px;
  margin: 0 auto;
}

.favorites-view__title {
  font-family: var(--font-serif);
  font-size: 1.6rem;
  color: var(--color-primary);
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.favorites-view__list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.favorite-item {
  display: flex;
  align-items: center;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-md) var(--spacing-lg);
  transition: all 0.2s;
}
.favorite-item:hover {
  border-color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(58, 46, 46, 0.08);
}

.favorite-item__info {
  flex: 1;
  cursor: pointer;
  min-width: 0;
}

.favorite-item__title {
  font-family: var(--font-serif);
  font-size: 1.1rem;
  color: var(--color-text);
  margin-bottom: var(--spacing-xs);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.favorite-item__meta {
  font-size: 0.85rem;
  color: var(--color-text-light);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.favorite-item__dynasty {
  color: var(--color-accent);
}

.favorite-item__time {
  font-size: 0.8rem;
  color: var(--color-text-light);
}

.favorite-item__remove {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color-border);
  border-radius: 50%;
  background: transparent;
  color: #c0392b;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: var(--spacing-md);
}
.favorite-item__remove:hover {
  background: rgba(192, 57, 43, 0.08);
  border-color: #c0392b;
}

.favorites-view__empty {
  text-align: center;
  padding: var(--spacing-xl) 0;
}
.favorites-view__empty p {
  color: var(--color-text-light);
  margin-bottom: var(--spacing-md);
  font-size: 1rem;
}
</style>

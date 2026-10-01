<template>
  <div class="detail-view container">
    <!-- 加载状态 -->
    <loading-spinner v-if="loading" text="正在加载诗词..." />

    <!-- 错误状态 -->
    <div v-else-if="error" class="detail-error">
      <p class="error-text">{{ error }}</p>
      <div class="detail-error__actions">
        <button class="btn btn-outline" @click="fetchPoem">重试</button>
        <router-link to="/" class="btn btn-primary">返回首页</router-link>
      </div>
    </div>

    <!-- 诗词详情 -->
    <article v-else-if="poem" class="detail-content">
      <!-- 返回按钮 -->
      <button class="back-btn" @click="goBack">&larr; 返回</button>

      <header class="detail-header">
        <h1 class="detail-title poem-title">{{ convertText(poem.title) }}</h1>
        <div class="detail-meta text-light">
          <span class="detail-dynasty">[{{ poem.dynasty }}]</span>
          <span class="detail-author">{{ convertText(poem.author) }}</span>
          <span v-if="poem.category" class="detail-category">{{ poem.category }}</span>
        </div>
        <!-- 收藏按钮 -->
        <button
          class="detail-fav-btn"
          :class="{ active: isFav }"
          @click="handleToggleFav"
          :title="isFav ? '取消收藏' : '收藏'"
        >
          {{ isFav ? '♥ 已收藏' : '♡ 收藏' }}
        </button>
      </header>

      <div class="detail-body poem-content">
        <p v-for="(line, i) in contentLines" :key="i" class="poem-line">{{ convertText(line) }}</p>
      </div>

      <!-- 注释区域（如有） -->
      <div v-if="poem.annotation" class="detail-annotation">
        <h3>注释</h3>
        <p>{{ poem.annotation }}</p>
      </div>
    </article>

    <!-- 未找到 -->
    <empty-state v-else message="未找到该诗词" action-text="返回首页" @action="$router.push('/')" />
  </div>
</template>

<script setup>
/**
 * 诗词详情页 — 完整展示诗词信息
 * 二期：新增收藏按钮 + 繁简转换
 */
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getPoemById } from '../api/index.js';
import LoadingSpinner from '../components/loading-spinner.vue';
import EmptyState from '../components/empty-state.vue';
import { useScriptMode } from '../composables/useScriptMode.js';
import { useFavorites } from '../composables/useFavorites.js';

const route = useRoute();
const router = useRouter();

const poem = ref(null);
const loading = ref(true);
const error = ref('');

const { convertText } = useScriptMode();
const { isFavorite, toggleFavorite } = useFavorites();

/** 当前诗词是否已收藏 */
const isFav = computed(() => poem.value ? isFavorite(poem.value.id) : false);

/** 将正文按换行拆分为行 */
const contentLines = computed(() => {
  if (!poem.value?.content) return [];
  return poem.value.content.split('\n').filter(line => line.trim());
});

/** 切换收藏状态 */
function handleToggleFav() {
  if (poem.value) {
    toggleFavorite({
      id: poem.value.id,
      title: poem.value.title,
      author: poem.value.author,
      dynasty: poem.value.dynasty,
      category: poem.value.category || '',
    });
  }
}

/** 获取诗词详情 */
async function fetchPoem() {
  const id = route.params.id;
  loading.value = true;
  error.value = '';
  try {
    poem.value = await getPoemById(id);
  } catch (err) {
    if (err.code === 404) {
      error.value = '未找到该诗词';
    } else {
      error.value = err.message || '数据加载失败，请稍后重试';
    }
  } finally {
    loading.value = false;
  }
}

/** 返回上一页或浏览页 */
function goBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/browse');
  }
}

/** 监听路由参数变化 */
watch(() => route.params.id, () => {
  if (route.name === 'PoemDetail') {
    fetchPoem();
  }
});

onMounted(fetchPoem);
</script>

<style scoped>
.detail-view {
  padding-top: var(--spacing-lg);
  padding-bottom: var(--spacing-xl);
  max-width: 800px;
  margin: 0 auto;
}

.back-btn {
  display: inline-block;
  margin-bottom: var(--spacing-lg);
  color: var(--color-text-light);
  font-size: 0.9rem;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}
.back-btn:hover {
  color: var(--color-primary);
  background: rgba(139, 69, 19, 0.05);
}

.detail-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
}

.detail-title {
  font-family: var(--font-serif);
  font-size: 2rem;
  color: var(--color-primary);
  margin-bottom: var(--spacing-sm);
}

.detail-meta {
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
}

.detail-dynasty {
  color: var(--color-accent);
}

.detail-category {
  padding: 2px 8px;
  background: rgba(47, 79, 79, 0.08);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
}

/* 收藏按钮 */
.detail-fav-btn {
  display: inline-block;
  margin-top: var(--spacing-md);
  padding: var(--spacing-xs) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  font-size: 0.9rem;
  color: var(--color-text-light);
  background: transparent;
  cursor: pointer;
  transition: all 0.2s;
}
.detail-fav-btn:hover {
  border-color: #c0392b;
  color: #c0392b;
}
.detail-fav-btn.active {
  color: #c0392b;
  border-color: #c0392b;
  background: rgba(192, 57, 43, 0.05);
}

.detail-body {
  padding: var(--spacing-lg) 0;
}

.poem-line {
  font-family: var(--font-serif);
  font-size: 1.2rem;
  line-height: 2.2;
  text-align: center;
  color: var(--color-text);
}

.detail-annotation {
  margin-top: var(--spacing-xl);
  padding: var(--spacing-lg);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}
.detail-annotation h3 {
  font-family: var(--font-serif);
  color: var(--color-primary);
  margin-bottom: var(--spacing-sm);
  font-size: 1rem;
}
.detail-annotation p {
  font-size: 0.9rem;
  line-height: 1.8;
  color: var(--color-text-light);
}

.detail-error {
  text-align: center;
  padding: var(--spacing-xl);
}
.detail-error p {
  margin-bottom: var(--spacing-md);
  font-size: 1.1rem;
}
.detail-error__actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
}
</style>

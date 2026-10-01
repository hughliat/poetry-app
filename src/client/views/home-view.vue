<template>
  <div class="home-view container">
    <!-- 随机推荐区域 -->
    <section class="home-section">
      <loading-spinner v-if="loading" text="正在寻找一首好诗..." />
      <div v-else-if="error" class="home-error">
        <p class="error-text">{{ error }}</p>
        <button class="btn btn-outline" @click="fetchRandom">重试</button>
      </div>
      <random-card v-else-if="poem" :poem="poem" @refresh="fetchRandom" />
      <empty-state v-else message="暂无诗词数据，请先执行数据初始化（npm run init-data）" />
    </section>

    <!-- 快捷入口 -->
    <section class="home-shortcuts">
      <h2 class="section-title">探索诗词</h2>
      <div class="shortcut-grid">
        <router-link to="/browse" class="shortcut-card">
          <div class="shortcut-icon">&#128218;</div>
          <h3>浏览诗词</h3>
          <p class="text-light">按朝代、作者分类浏览</p>
        </router-link>
        <router-link to="/search?q=月" class="shortcut-card">
          <div class="shortcut-icon">&#127769;</div>
          <h3>搜索诗词</h3>
          <p class="text-light">关键词全文搜索</p>
        </router-link>
      </div>
    </section>

    <!-- 朝代快捷入口 -->
    <section class="home-dynasties" v-if="dynasties.length">
      <h2 class="section-title">按朝代浏览</h2>
      <div class="dynasty-links">
        <router-link
          v-for="d in dynasties"
          :key="d.id"
          :to="{ path: '/browse', query: { dynasty: d.name } }"
          class="dynasty-link"
        >
          {{ d.name }}
          <span class="dynasty-count text-light">({{ d.poemCount }}首)</span>
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
/**
 * 首页 — 随机推荐 + 快捷入口
 */
import { ref, onMounted } from 'vue';
import { getRandomPoem, getDynasties } from '../api/index.js';
import RandomCard from '../components/random-card.vue';
import LoadingSpinner from '../components/loading-spinner.vue';
import EmptyState from '../components/empty-state.vue';

const poem = ref(null);
const loading = ref(true);
const error = ref('');
const dynasties = ref([]);

/** 获取随机诗词 */
async function fetchRandom() {
  loading.value = true;
  error.value = '';
  try {
    poem.value = await getRandomPoem();
  } catch (err) {
    error.value = err.message || '数据加载失败';
  } finally {
    loading.value = false;
  }
}

/** 获取朝代列表 */
async function fetchDynasties() {
  try {
    dynasties.value = await getDynasties();
  } catch {
    // 朝代列表非核心功能，静默失败
  }
}

onMounted(() => {
  fetchRandom();
  fetchDynasties();
});
</script>

<style scoped>
.home-view {
  padding-top: var(--spacing-xl);
  padding-bottom: var(--spacing-xl);
}

.home-section {
  margin-bottom: var(--spacing-xl);
}

.home-error {
  text-align: center;
  padding: var(--spacing-xl);
}
.home-error p {
  margin-bottom: var(--spacing-md);
}

.home-shortcuts {
  margin-bottom: var(--spacing-xl);
}

.section-title {
  font-family: var(--font-serif);
  font-size: 1.3rem;
  color: var(--color-primary);
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
  max-width: 600px;
  margin: 0 auto;
}

.shortcut-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  text-align: center;
  transition: all 0.2s;
  box-shadow: var(--shadow-card);
}
.shortcut-card:hover {
  border-color: var(--color-primary);
  transform: translateY(-2px);
}

.shortcut-icon {
  font-size: 2rem;
  margin-bottom: var(--spacing-sm);
}

.shortcut-card h3 {
  font-family: var(--font-serif);
  color: var(--color-text);
  margin-bottom: var(--spacing-xs);
}

.home-dynasties {
  text-align: center;
}

.dynasty-links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--spacing-md);
}

.dynasty-link {
  padding: var(--spacing-sm) var(--spacing-lg);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  font-family: var(--font-serif);
  font-size: 1rem;
  color: var(--color-text);
  transition: all 0.2s;
}
.dynasty-link:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.dynasty-count {
  font-size: 0.8rem;
  margin-left: var(--spacing-xs);
}
</style>

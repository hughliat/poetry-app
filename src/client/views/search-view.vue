<template>
  <div class="search-view container">
    <h1 class="page-title" v-if="keyword">
      搜索：「<span class="highlight">{{ keyword }}」</span>
    </h1>
    <h1 class="page-title" v-else>搜索诗词</h1>

    <!-- 移动端搜索框 -->
    <div class="search-input-wrap">
      <input
        type="text"
        class="search-input"
        placeholder="输入关键词搜索..."
        v-model="localKeyword"
        @keyup.enter="doSearch"
      />
      <button class="btn btn-primary" @click="doSearch">搜索</button>
    </div>

    <!-- 加载状态 -->
    <loading-spinner v-if="loading" />

    <!-- 错误状态 -->
    <div v-else-if="error" class="search-error">
      <p class="error-text">{{ error }}</p>
      <button class="btn btn-outline" @click="fetchResults">重试</button>
    </div>

    <!-- 空状态 -->
    <empty-state
      v-else-if="searched && !results.length"
      :message="`未找到与'${keyword}'相关的诗词，请尝试其他关键词`"
    />

    <!-- 搜索结果列表 -->
    <template v-else-if="results.length">
      <p class="result-count text-light">
        共找到 <strong>{{ total }}</strong> 首相关诗词
      </p>
      <div class="poem-grid">
        <poem-card
          v-for="poem in results"
          :key="poem.id"
          :poem="poem"
          :highlight-keyword="highlightKeyword"
        />
      </div>

      <pagination
        :current-page="page"
        :total="total"
        :page-size="pageSize"
        @page-change="onPageChange"
      />
    </template>

    <!-- 初始状态提示 -->
    <empty-state
      v-else-if="!keyword"
      message="请输入关键词开始搜索"
    />
  </div>
</template>

<script setup>
/**
 * 搜索页 — 搜索结果列表 + 关键词高亮 + 分页
 * 二期：使用 originalKeyword 做高亮 + 繁简转换
 */
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { searchPoems } from '../api/index.js';
import PoemCard from '../components/poem-card.vue';
import Pagination from '../components/pagination.vue';
import LoadingSpinner from '../components/loading-spinner.vue';
import EmptyState from '../components/empty-state.vue';
import { useScriptMode } from '../composables/useScriptMode.js';

const route = useRoute();
const router = useRouter();
const { convertText } = useScriptMode();

const results = ref([]);
const total = ref(0);
const page = ref(1);
const pageSize = 20;
const loading = ref(false);
const error = ref('');
const searched = ref(false);
const localKeyword = ref('');

/** 当前搜索关键词 */
const keyword = ref(route.query.q || '');

/** 用于高亮的关键词（从 API 响应读取 originalKeyword） */
const highlightKeyword = ref('');

/** 执行搜索 */
function doSearch() {
  const q = localKeyword.value.trim();
  if (q) {
    router.push({ name: 'Search', query: { q } });
  }
}

/** 获取搜索结果 */
async function fetchResults() {
  if (!keyword.value) return;
  loading.value = true;
  error.value = '';
  searched.value = true;
  try {
    const data = await searchPoems({
      q: keyword.value,
      page: page.value,
      pageSize,
    });
    results.value = data.list;
    total.value = data.total;
    // 从 API 响应中读取 originalKeyword 用于高亮
    highlightKeyword.value = data.originalKeyword || keyword.value;
  } catch (err) {
    error.value = err.message || '搜索失败，请稍后重试';
  } finally {
    loading.value = false;
  }
}

/** 翻页 */
function onPageChange(newPage) {
  page.value = newPage;
  fetchResults();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/** 监听路由 query 变化 */
watch(
  () => route.query.q,
  (newQ) => {
    keyword.value = newQ || '';
    localKeyword.value = newQ || '';
    page.value = 1;
    if (newQ) {
      fetchResults();
    } else {
      results.value = [];
      total.value = 0;
      searched.value = false;
      highlightKeyword.value = '';
    }
  }
);

onMounted(() => {
  localKeyword.value = keyword.value;
  if (keyword.value) {
    fetchResults();
  }
});
</script>

<style scoped>
.search-view {
  padding-top: var(--spacing-lg);
  padding-bottom: var(--spacing-xl);
}

.search-input-wrap {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  max-width: 500px;
}

.search-input {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  background: var(--color-bg-card);
  transition: border-color 0.2s;
}
.search-input:focus {
  border-color: var(--color-primary);
}

.result-count {
  margin-bottom: var(--spacing-md);
  font-size: 0.9rem;
}

.poem-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.search-error {
  text-align: center;
  padding: var(--spacing-xl);
}
.search-error p {
  margin-bottom: var(--spacing-md);
}
</style>

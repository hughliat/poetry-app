<template>
  <div class="browse-view container">
    <h1 class="page-title">浏览诗词</h1>

    <div class="browse-layout">
      <!-- 左侧筛选面板 -->
      <filter-panel
        class="filter-panel"
        :dynasties="dynasties"
        :authors="authors"
        :categories="categories"
        :selected-dynasty="filters.dynasty"
        :selected-author="filters.author"
        :selected-category="filters.category"
        @update:dynasty="onFilterChange('dynasty', $event)"
        @update:author="onFilterChange('author', $event)"
        @update:category="onFilterChange('category', $event)"
      />

      <!-- 右侧列表区域 -->
      <div class="browse-content">
        <!-- 加载状态 -->
        <loading-spinner v-if="loading && !poems.length" />

        <!-- 空状态 -->
        <empty-state
          v-else-if="!loading && !poems.length"
          message="该分类下暂无诗词，请尝试其他筛选条件"
        />

        <!-- 诗词列表 -->
        <template v-else>
          <div class="poem-grid">
            <poem-card
              v-for="poem in poems"
              :key="poem.id"
              :poem="poem"
            />
          </div>

          <!-- 翻页加载指示 -->
          <loading-spinner v-if="loading && poems.length" text="加载中..." />

          <!-- 分页 -->
          <pagination
            :current-page="page"
            :total="total"
            :page-size="pageSize"
            @page-change="onPageChange"
          />
        </template>

        <!-- 错误状态 -->
        <div v-if="error && !poems.length" class="browse-error">
          <p class="error-text">{{ error }}</p>
          <button class="btn btn-outline" @click="fetchPoems">重试</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 浏览页 — 筛选面板 + 诗词列表 + 分页
 * 二期：筛选折叠交互、移动端布局
 */
import { ref, reactive, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getPoems, getDynasties, getAuthors, getCategories } from '../api/index.js';
import FilterPanel from '../components/filter-panel.vue';
import PoemCard from '../components/poem-card.vue';
import Pagination from '../components/pagination.vue';
import LoadingSpinner from '../components/loading-spinner.vue';
import EmptyState from '../components/empty-state.vue';

const route = useRoute();
const router = useRouter();

const poems = ref([]);
const total = ref(0);
const page = ref(1);
const pageSize = 20;
const loading = ref(false);
const error = ref('');

const dynasties = ref([]);
const authors = ref([]);
const categories = ref([]);

/** 筛选条件 */
const filters = reactive({
  dynasty: route.query.dynasty || '',
  author: route.query.author || '',
  category: route.query.category || '',
});

/** 获取诗词列表 */
async function fetchPoems() {
  loading.value = true;
  error.value = '';
  try {
    const params = { page: page.value, pageSize };
    if (filters.dynasty) params.dynasty = filters.dynasty;
    if (filters.author) params.author = filters.author;
    if (filters.category) params.category = filters.category;

    const data = await getPoems(params);
    poems.value = data.list;
    total.value = data.total;
  } catch (err) {
    error.value = err.message || '数据加载失败';
  } finally {
    loading.value = false;
  }
}

/** 筛选条件变更 */
function onFilterChange(key, value) {
  filters[key] = value;
  page.value = 1;
  // 同步到 URL query
  const query = {};
  if (filters.dynasty) query.dynasty = filters.dynasty;
  if (filters.author) query.author = filters.author;
  if (filters.category) query.category = filters.category;
  router.replace({ path: '/browse', query });
}

/** 翻页 */
function onPageChange(newPage) {
  page.value = newPage;
  fetchPoems();
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/** 加载筛选选项 */
async function loadFilterOptions() {
  try {
    const [d, c] = await Promise.all([getDynasties(), getCategories()]);
    dynasties.value = d;
    categories.value = c;
  } catch {
    // 筛选选项加载失败不影响主功能
  }
}

/** 加载指定朝代的作者列表 */
async function loadAuthors() {
  if (!filters.dynasty) {
    authors.value = [];
    return;
  }
  try {
    authors.value = await getAuthors({ dynasty: filters.dynasty });
  } catch {
    authors.value = [];
  }
}

/** 监听朝代变化，加载对应作者 */
watch(() => filters.dynasty, () => {
  loadAuthors();
});

onMounted(() => {
  loadFilterOptions();
  loadAuthors();
  fetchPoems();
});
</script>

<style scoped>
.browse-view {
  padding-top: var(--spacing-lg);
  padding-bottom: var(--spacing-xl);
}

.browse-layout {
  display: flex;
  gap: var(--spacing-lg);
}

.browse-content {
  flex: 1;
  min-width: 0;
}

.poem-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.browse-error {
  text-align: center;
  padding: var(--spacing-xl);
}
.browse-error p {
  margin-bottom: var(--spacing-md);
}
</style>

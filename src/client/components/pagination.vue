<template>
  <nav class="pagination" v-if="totalPages > 1">
    <button
      class="pagination__btn btn-outline"
      :disabled="currentPage <= 1"
      @click="goToPage(currentPage - 1)"
    >
      上一页
    </button>

    <div class="pagination__pages">
      <!-- 首页 -->
      <button
        v-if="showFirst"
        class="pagination__num"
        :class="{ active: currentPage === 1 }"
        @click="goToPage(1)"
      >1</button>
      <span v-if="showFirst && currentPage > 3" class="pagination__ellipsis">...</span>

      <!-- 中间页码 -->
      <button
        v-for="p in visiblePages"
        :key="p"
        class="pagination__num"
        :class="{ active: p === currentPage }"
        @click="goToPage(p)"
      >{{ p }}</button>

      <!-- 末页 -->
      <span v-if="showLast && currentPage < totalPages - 2" class="pagination__ellipsis">...</span>
      <button
        v-if="showLast"
        class="pagination__num"
        :class="{ active: currentPage === totalPages }"
        @click="goToPage(totalPages)"
      >{{ totalPages }}</button>
    </div>

    <button
      class="pagination__btn btn-outline"
      :disabled="currentPage >= totalPages"
      @click="goToPage(currentPage + 1)"
    >
      下一页
    </button>
  </nav>
</template>

<script setup>
/**
 * 分页控件
 * 显示页码、上一页/下一页按钮
 * 二期：移动端紧凑分页样式（通过 responsive.css 控制）
 */
import { computed } from 'vue';

const props = defineProps({
  currentPage: { type: Number, required: true },
  total: { type: Number, required: true },
  pageSize: { type: Number, default: 20 },
});

const emit = defineEmits(['page-change']);

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)));

/** 当前页前后各显示 2 个页码 */
const visiblePages = computed(() => {
  const pages = [];
  const start = Math.max(2, props.currentPage - 2);
  const end = Math.min(totalPages.value - 1, props.currentPage + 2);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  return pages;
});

const showFirst = computed(() => totalPages.value > 1);
const showLast = computed(() => totalPages.value > 1 && !visiblePages.value.includes(totalPages.value));

function goToPage(page) {
  if (page >= 1 && page <= totalPages.value && page !== props.currentPage) {
    emit('page-change', page);
  }
}
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-lg) 0;
  font-family: var(--font-sans);
}

.pagination__pages {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.pagination__num {
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  color: var(--color-text);
  transition: all 0.2s;
}
.pagination__num:hover {
  background: var(--color-border);
}
.pagination__num.active {
  background: var(--color-primary);
  color: #fff;
}

.pagination__ellipsis {
  color: var(--color-text-light);
  padding: 0 var(--spacing-xs);
}

.pagination__btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>

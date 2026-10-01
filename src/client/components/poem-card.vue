<template>
  <div class="poem-card" @click="goToDetail">
    <div class="poem-card__header">
      <h3 class="poem-card__title poem-title">{{ convertText(poem.title) }}</h3>
      <span class="poem-card__dynasty">{{ poem.dynasty }}</span>
    </div>
    <p class="poem-card__author text-light">
      {{ convertText(poem.author) }}
      <span v-if="poem.category" class="poem-card__category">{{ poem.category }}</span>
    </p>
    <!-- 摘要内容，支持关键词高亮 -->
    <p class="poem-card__summary poem-content" v-if="poem.summary">
      <span v-if="highlightKeyword" v-html="highlightedSummary"></span>
      <span v-else>{{ convertText(poem.summary) }}</span>
    </p>
  </div>
</template>

<script setup>
/**
 * 诗词卡片组件
 * 用于列表展示，点击跳转到详情页
 * 二期增强：高亮函数三级匹配 + 繁简转换
 */
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useScriptMode } from '../composables/useScriptMode.js';
import { toTraditional } from '../utils/converter.js';

const props = defineProps({
  poem: {
    type: Object,
    required: true,
  },
  /** 搜索高亮关键词 */
  highlightKeyword: {
    type: String,
    default: '',
  },
});

const router = useRouter();
const { convertText } = useScriptMode();

/**
 * 高亮处理后的摘要
 * 三级匹配策略：原始关键词 -> 繁体转换 -> 放弃高亮（返回原文）
 */
const highlightedSummary = computed(() => {
  if (!props.highlightKeyword || !props.poem.summary) return convertText(props.poem.summary);
  const keyword = props.highlightKeyword;
  const text = props.poem.summary;

  // 第一步：使用原始关键词尝试匹配
  let result = highlightText(text, keyword);
  if (result !== text) return result;

  // 第二步：原始关键词未匹配，尝试将关键词转为繁体后再匹配
  const traditionalKeyword = toTraditional(keyword);
  if (traditionalKeyword !== keyword) {
    result = highlightText(text, traditionalKeyword);
    if (result !== text) return result;
  }

  // 第三步：仍未匹配，返回原文（经繁简转换）
  return convertText(text);
});

/**
 * 安全高亮文本中的关键词
 * @param {string} text - 原始文本
 * @param {string} keyword - 要高亮的关键词
 * @returns {string} 包含 <mark> 标签的 HTML 字符串
 */
function highlightText(text, keyword) {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  if (!regex.test(text)) return text;
  return text.replace(regex, '<mark class="highlight">$1</mark>');
}

/** 跳转到诗词详情页 */
function goToDetail() {
  router.push({ name: 'PoemDetail', params: { id: props.poem.id } });
}
</script>

<style scoped>
.poem-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: var(--shadow-card);
}
.poem-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 4px 16px rgba(58, 46, 46, 0.12);
  transform: translateY(-2px);
}

.poem-card__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: var(--spacing-xs);
}

.poem-card__title {
  font-size: 1.15rem;
  color: var(--color-text);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.poem-card__dynasty {
  font-size: 0.8rem;
  color: var(--color-accent);
  background: rgba(47, 79, 79, 0.08);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  margin-left: var(--spacing-sm);
  white-space: nowrap;
}

.poem-card__author {
  font-size: 0.9rem;
  margin-bottom: var(--spacing-sm);
}

.poem-card__category {
  margin-left: var(--spacing-sm);
  font-size: 0.8rem;
  color: var(--color-text-light);
}
.poem-card__category::before {
  content: '·';
  margin-right: var(--spacing-xs);
}

.poem-card__summary {
  font-size: 0.9rem;
  color: var(--color-text-light);
  line-height: 1.6;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

:deep(mark.highlight) {
  background: var(--color-highlight, #fff3cd);
  color: var(--color-text);
  padding: 0 2px;
  border-radius: 2px;
}
</style>

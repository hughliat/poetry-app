<template>
  <div class="random-card" v-if="poem">
    <div class="random-card__badge">今日推荐</div>
    <h2 class="random-card__title poem-title" @click="goToDetail">{{ convertText(poem.title) }}</h2>
    <p class="random-card__meta text-light">
      [{{ poem.dynasty }}] {{ convertText(poem.author) }}
      <span v-if="poem.category"> · {{ poem.category }}</span>
    </p>
    <div class="random-card__content">
      <p v-for="(line, i) in contentLines" :key="i" class="poem-line">{{ convertText(line) }}</p>
    </div>
    <div class="random-card__actions">
      <button class="btn btn-primary" @click="$emit('refresh')">换一首</button>
      <button class="btn btn-outline" @click="goToDetail">阅读全文</button>
    </div>
  </div>
</template>

<script setup>
/**
 * 随机推荐卡片组件
 * 首页展示随机诗词摘要
 * 二期：新增繁简转换
 */
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useScriptMode } from '../composables/useScriptMode.js';

const props = defineProps({
  poem: { type: Object, default: null },
});

defineEmits(['refresh']);

const router = useRouter();
const { convertText } = useScriptMode();

/** 将正文按换行拆分为数组 */
const contentLines = computed(() => {
  if (!props.poem?.content) return [];
  return props.poem.content.split('\n').filter(line => line.trim());
});

function goToDetail() {
  if (props.poem?.id) {
    router.push({ name: 'PoemDetail', params: { id: props.poem.id } });
  }
}
</script>

<style scoped>
.random-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--spacing-xl);
  text-align: center;
  box-shadow: var(--shadow-card);
  max-width: 600px;
  margin: 0 auto;
  position: relative;
}

.random-card__badge {
  position: absolute;
  top: var(--spacing-md);
  right: var(--spacing-md);
  background: var(--color-accent);
  color: #fff;
  font-size: 0.75rem;
  padding: 2px 10px;
  border-radius: 20px;
  font-family: var(--font-sans);
}

.random-card__title {
  font-size: 1.6rem;
  color: var(--color-primary);
  margin-bottom: var(--spacing-sm);
  cursor: pointer;
  transition: color 0.2s;
}
.random-card__title:hover {
  color: var(--color-primary-hover);
}

.random-card__meta {
  font-size: 0.9rem;
  margin-bottom: var(--spacing-lg);
}

.random-card__content {
  padding: var(--spacing-md) 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  margin-bottom: var(--spacing-lg);
}

.poem-line {
  font-size: 1.1rem;
  line-height: 2;
  color: var(--color-text);
}

.random-card__actions {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
}
</style>

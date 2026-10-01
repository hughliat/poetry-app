<template>
  <div class="filter-panel">
    <!-- 移动端折叠按钮 -->
    <button class="filter-panel__toggle" @click="expanded = !expanded">
      <span>筛选条件</span>
      <span class="filter-panel__arrow" :class="{ expanded }">&#9660;</span>
    </button>

    <div class="filter-panel__body" :class="{ expanded }">
      <h3 class="filter-panel__title">筛选条件</h3>

      <!-- 朝代筛选 -->
      <div class="filter-group">
        <label class="filter-group__label">朝代</label>
        <div class="filter-group__options">
          <button
            class="filter-tag"
            :class="{ active: selectedDynasty === '' }"
            @click="selectDynasty('')"
          >全部</button>
          <button
            v-for="d in dynasties"
            :key="d.id"
            class="filter-tag"
            :class="{ active: selectedDynasty === d.name }"
            @click="selectDynasty(d.name)"
          >{{ d.name }}</button>
        </div>
      </div>

      <!-- 作者筛选 -->
      <div class="filter-group" v-if="selectedDynasty">
        <label class="filter-group__label">作者</label>
        <div class="filter-group__options">
          <button
            class="filter-tag"
            :class="{ active: selectedAuthor === '' }"
            @click="selectAuthor('')"
          >全部</button>
          <button
            v-for="a in authors"
            :key="a.id"
            class="filter-tag"
            :class="{ active: selectedAuthor === a.name }"
            @click="selectAuthor(a.name)"
          >{{ a.name }}</button>
        </div>
      </div>

      <!-- 分类筛选 -->
      <div class="filter-group">
        <label class="filter-group__label">分类</label>
        <div class="filter-group__options">
          <button
            class="filter-tag"
            :class="{ active: selectedCategory === '' }"
            @click="selectCategory('')"
          >全部</button>
          <button
            v-for="c in categories"
            :key="c.name"
            class="filter-tag"
            :class="{ active: selectedCategory === c.name }"
            @click="selectCategory(c.name)"
          >{{ c.name }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * 筛选面板组件
 * 支持朝代、作者、分类三级筛选
 * 二期：新增移动端折叠支持
 */
import { ref } from 'vue';

defineProps({
  dynasties: { type: Array, default: () => [] },
  authors: { type: Array, default: () => [] },
  categories: { type: Array, default: () => [] },
  selectedDynasty: { type: String, default: '' },
  selectedAuthor: { type: String, default: '' },
  selectedCategory: { type: String, default: '' },
});

const emit = defineEmits(['update:dynasty', 'update:author', 'update:category']);

// 移动端折叠状态（桌面端通过 CSS 强制展开）
const expanded = ref(false);

function selectDynasty(name) {
  emit('update:dynasty', name);
  // 切换朝代时清空作者选择
  emit('update:author', '');
}

function selectAuthor(name) {
  emit('update:author', name);
}

function selectCategory(name) {
  emit('update:category', name);
}
</script>

<style scoped>
.filter-panel {
  width: 240px;
  flex-shrink: 0;
}

.filter-panel__title {
  font-family: var(--font-serif);
  font-size: 1.1rem;
  color: var(--color-primary);
  margin-bottom: var(--spacing-md);
}

/* 移动端折叠按钮（桌面端隐藏） */
.filter-panel__toggle {
  display: none; /* 桌面端不显示 */
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-card);
  font-size: 1rem;
  color: var(--color-text);
  cursor: pointer;
  margin-bottom: var(--spacing-sm);
}

.filter-panel__arrow {
  font-size: 0.7rem;
  transition: transform 0.2s;
}
.filter-panel__arrow.expanded {
  transform: rotate(180deg);
}

.filter-group {
  margin-bottom: var(--spacing-md);
}

.filter-group__label {
  display: block;
  font-size: 0.85rem;
  color: var(--color-text-light);
  margin-bottom: var(--spacing-xs);
  font-weight: 500;
}

.filter-group__options {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.filter-tag {
  padding: 4px 12px;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  font-size: 0.85rem;
  color: var(--color-text);
  background: var(--color-bg-card);
  transition: all 0.2s;
  cursor: pointer;
}
.filter-tag:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}
.filter-tag.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}
</style>

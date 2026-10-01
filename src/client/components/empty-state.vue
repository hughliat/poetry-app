<template>
  <div class="empty-state">
    <div class="empty-icon">&#128214;</div>
    <p class="empty-text">{{ message }}</p>
    <button v-if="actionText" class="btn btn-outline" @click="$emit('action')">
      {{ actionText }}
    </button>
  </div>
</template>

<script setup>
/**
 * 空状态提示组件
 * 用于列表为空、搜索无结果等场景
 */
defineProps({
  message: {
    type: String,
    default: '暂无数据',
  },
  actionText: {
    type: String,
    default: '',
  },
});

defineEmits(['action']);
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl) var(--spacing-md);
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: var(--spacing-md);
  opacity: 0.5;
}

.empty-text {
  color: var(--color-text-light);
  font-size: 0.95rem;
  margin-bottom: var(--spacing-md);
  max-width: 360px;
  line-height: 1.6;
}
</style>

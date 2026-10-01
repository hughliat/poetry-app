<template>
  <div class="loading-spinner">
    <div class="spinner"></div>
    <p class="loading-text">{{ text }}</p>
  </div>
</template>

<script setup>
/**
 * 加载指示器组件
 * 旋转动画 + 文字提示
 */
defineProps({
  text: {
    type: String,
    default: '加载中...',
  },
});
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl) 0;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  margin-top: var(--spacing-sm);
  color: var(--color-text-light);
  font-size: 0.9rem;
  font-family: var(--font-sans);
}
</style>

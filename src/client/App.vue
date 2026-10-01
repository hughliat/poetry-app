<template>
  <div class="app">
    <nav-bar />
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
/**
 * 根组件
 * 包含全局导航栏 + 路由出口
 */
import NavBar from './components/nav-bar.vue';
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-main {
  flex: 1;
}
</style>

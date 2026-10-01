/**
 * 收藏功能组合式函数
 * 封装收藏的增删查改业务逻辑，与存储层解耦
 * 使用模块级单例状态，惰性初始化，跨标签页 storage 事件监听
 */
import { ref, computed } from 'vue';
import { loadFavorites, saveFavorites, isStorageAvailable } from '../utils/storage.js';

// 模块级单例状态
const favorites = ref([]);
const initialized = ref(false);

// 跨标签页同步：监听 storage 事件
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'poetry_favorites') {
      const data = loadFavorites();
      favorites.value = data.items;
    }
  });
}

/**
 * 收藏功能组合式函数
 * @returns {Object} 收藏相关状态与方法
 */
export function useFavorites() {
  // 惰性初始化：首次调用时从 localStorage 加载
  if (!initialized.value) {
    const data = loadFavorites();
    favorites.value = data.items;
    initialized.value = true;
  }

  /** 收藏列表（按 addedAt 降序） */
  const favoriteList = computed(() =>
    [...favorites.value].sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt))
  );

  /** 收藏数量 */
  const favoriteCount = computed(() => favorites.value.length);

  /** localStorage 是否可用 */
  const storageAvailable = isStorageAvailable();

  /**
   * 判断某首诗词是否已收藏
   * @param {string} poemId - 诗词 ID
   * @returns {boolean}
   */
  function isFavorite(poemId) {
    return favorites.value.some(item => item.id === poemId);
  }

  /**
   * 收藏一首诗词
   * @param {{ id: string, title: string, author: string, dynasty: string, category: string }} poem
   * @returns {boolean} 操作是否成功
   */
  function addFavorite(poem) {
    if (isFavorite(poem.id)) return true; // 已收藏，幂等
    const item = {
      id: poem.id,
      title: poem.title,
      author: poem.author,
      dynasty: poem.dynasty,
      category: poem.category || '',
      addedAt: new Date().toISOString(),
    };
    favorites.value = [...favorites.value, item];
    return saveFavorites({ version: 1, items: favorites.value });
  }

  /**
   * 取消收藏
   * @param {string} poemId - 诗词 ID
   * @returns {boolean} 操作是否成功
   */
  function removeFavorite(poemId) {
    favorites.value = favorites.value.filter(item => item.id !== poemId);
    return saveFavorites({ version: 1, items: favorites.value });
  }

  /**
   * 切换收藏状态
   * @param {{ id: string, title: string, author: string, dynasty: string, category: string }} poem
   * @returns {boolean} 操作后是否为已收藏状态
   */
  function toggleFavorite(poem) {
    if (isFavorite(poem.id)) {
      removeFavorite(poem.id);
      return false;
    } else {
      addFavorite(poem);
      return true;
    }
  }

  return {
    favoriteList,      // ComputedRef<Array>
    favoriteCount,     // ComputedRef<number>
    storageAvailable,  // boolean
    isFavorite,        // (poemId: string) => boolean
    addFavorite,       // (poem) => boolean
    removeFavorite,    // (poemId: string) => boolean
    toggleFavorite,    // (poem) => boolean
  };
}

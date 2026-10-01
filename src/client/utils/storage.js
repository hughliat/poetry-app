/**
 * localStorage 封装（收藏存储）
 * 提供异常安全的收藏数据读写
 */

const FAVORITES_KEY = 'poetry_favorites';
const CURRENT_VERSION = 1;

/**
 * 检测 localStorage 是否可用
 * @returns {boolean}
 */
export function isStorageAvailable() {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * 读取收藏数据
 * @returns {{ version: number, items: Array<FavoriteItem> }}
 */
export function loadFavorites() {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return { version: CURRENT_VERSION, items: [] };
    const data = JSON.parse(raw);
    // 版本检查，预留迁移能力
    if (data.version !== CURRENT_VERSION) {
      return migrateFavorites(data);
    }
    return data;
  } catch {
    // JSON 解析失败，数据损坏，返回空结构
    return { version: CURRENT_VERSION, items: [] };
  }
}

/**
 * 保存收藏数据
 * @param {{ version: number, items: Array<FavoriteItem> }} data
 * @returns {boolean} 是否保存成功
 */
export function saveFavorites(data) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    // 配额溢出等异常
    console.warn('[Storage] 保存收藏失败:', e.message);
    return false;
  }
}

/**
 * 数据结构迁移（预留）
 * @param {Object} oldData
 * @returns {{ version: number, items: Array }}
 */
function migrateFavorites(oldData) {
  // 当前 version=1，无需迁移，直接返回空
  return { version: CURRENT_VERSION, items: [] };
}

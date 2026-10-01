/**
 * 繁简切换组合式函数
 * 使用模块级 ref 单例，所有组件共享同一响应式状态
 * 通过 sessionStorage 持久化刷新恢复
 */
import { ref, computed } from 'vue';
import { convertScript } from '../utils/converter.js';

const STORAGE_KEY = 'scriptMode';

// 模块级单例状态（所有组件共享同一状态）
const currentMode = ref('simplified');

// 初始化：从 sessionStorage 恢复状态
function initMode() {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved === 'traditional' || saved === 'simplified') {
      currentMode.value = saved;
    }
  } catch {
    // sessionStorage 不可用时忽略，保持默认简体
  }
}
initMode();

/**
 * 繁简切换组合式函数
 * @returns {Object} 繁简切换相关状态与方法
 */
export function useScriptMode() {
  /** 当前是否为繁体模式 */
  const isTraditional = computed(() => currentMode.value === 'traditional');

  /** 切换繁简模式 */
  function toggleScriptMode() {
    currentMode.value = isTraditional.value ? 'simplified' : 'traditional';
    try {
      sessionStorage.setItem(STORAGE_KEY, currentMode.value);
    } catch {
      // sessionStorage 不可用时不阻断切换
    }
  }

  /**
   * 根据当前模式转换文本
   * @param {string} text - 原始文本（简体）
   * @returns {string} 转换后的文本
   */
  function convertText(text) {
    return convertScript(text, currentMode.value);
  }

  return {
    currentMode,       // Ref<string> 'simplified' | 'traditional'
    isTraditional,     // ComputedRef<boolean>
    toggleScriptMode,  // () => void
    convertText,       // (text: string) => string
  };
}

/**
 * 繁简转换工具（封装 opencc-js）
 * 提供简体/繁体互转的统一 API
 */
import OpenCC from 'opencc-js';

// 预创建转换器实例（单例模式，避免重复创建）
const s2tConverter = OpenCC.Converter('s', 't'); // 简体 -> 繁体
const t2sConverter = OpenCC.Converter('t', 's'); // 繁体 -> 简体

/**
 * 简体转繁体
 * @param {string} text - 简体文本
 * @returns {string} 繁体文本
 */
export function toTraditional(text) {
  if (!text) return text;
  return s2tConverter(text);
}

/**
 * 繁体转简体
 * @param {string} text - 繁体文本
 * @returns {string} 简体文本
 */
export function toSimplified(text) {
  if (!text) return text;
  return t2sConverter(text);
}

/**
 * 根据目标模式转换文本
 * @param {string} text - 原始文本
 * @param {'simplified'|'traditional'} mode - 目标模式
 * @returns {string} 转换后的文本
 */
export function convertScript(text, mode) {
  if (!text) return text;
  // 数据库存储的是简体文本，仅在目标为繁体时转换
  if (mode === 'traditional') {
    return toTraditional(text);
  }
  return text;
}

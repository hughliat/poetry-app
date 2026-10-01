/**
 * API 请求统一封装
 * 所有后端请求通过此模块发起，页面组件不直接调用 fetch
 */

const BASE_URL = '/api';

/**
 * 统一 fetch 封装
 * @param {string} url - 请求路径（不含 /api 前缀）
 * @param {object} params - 查询参数
 * @returns {Promise<object>} 响应数据
 */
async function request(url, params = {}) {
  // 构建查询字符串，过滤掉空值参数
  const query = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  ).toString();

  const fullUrl = query ? `${BASE_URL}${url}?${query}` : `${BASE_URL}${url}`;

  try {
    const response = await fetch(fullUrl);
    const data = await response.json();

    // 根据业务状态码判断
    if (!response.ok || (data.code && data.code !== 0)) {
      const error = new Error(data.message || `请求失败 (${response.status})`);
      error.code = data.code || response.status;
      throw error;
    }

    return data.data;
  } catch (err) {
    // 网络错误
    if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
      throw new Error('网络连接失败，请检查后端服务是否启动');
    }
    throw err;
  }
}

// ========== 诗词相关 API ==========

/**
 * 获取诗词列表（支持筛选与分页）
 */
export function getPoems(params = {}) {
  return request('/poems', params);
}

/**
 * 获取诗词详情
 */
export function getPoemById(id) {
  return request(`/poems/${encodeURIComponent(id)}`);
}

/**
 * 随机获取一首诗词
 */
export function getRandomPoem() {
  return request('/poems/random');
}

/**
 * 关键词搜索诗词
 */
export function searchPoems(params) {
  return request('/poems/search', params);
}

// ========== 作者相关 API ==========

/**
 * 获取作者列表（可按朝代筛选）
 */
export function getAuthors(params = {}) {
  return request('/authors', params);
}

// ========== 朝代相关 API ==========

/**
 * 获取朝代列表
 */
export function getDynasties() {
  return request('/dynasties');
}

// ========== 分类相关 API ==========

/**
 * 获取分类列表
 */
export function getCategories() {
  return request('/categories');
}

/**
 * 诗词业务逻辑层
 * 负责诗词相关的业务处理：分页计算、搜索关键词格式化、数据转换
 */
import * as poemDao from '../dao/poem-dao.js';
import OpenCC from 'opencc-js';

// 创建简体到繁体转换器（用于搜索时自动转换繁简）
// 使用 opencc-js 的正确 API：Converter({ from: 'cn', to: 'tw' })
const s2tConverter = OpenCC.Converter({ from: 'cn', to: 'tw' });

/**
 * 获取诗词列表（带分页与筛选）
 * @param {Object} query - 请求参数
 * @returns {{ list: Array, total: number, page: number, pageSize: number }}
 */
export function getPoemList(query) {
  // 参数校验与默认值
  const page = Math.max(1, parseInt(query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize) || 20));
  const offset = (page - 1) * pageSize;

  const { dynasty, author, category } = query;

  const { list, total } = poemDao.findPoems({
    pageSize,
    offset,
    dynasty: dynasty || undefined,
    author: author || undefined,
    category: category || undefined,
  });

  return { list, total, page, pageSize };
}

/**
 * 获取诗词详情
 * @param {string} id - 诗词 ID
 * @returns {Object|null} 诗词详情，不存在返回 null
 */
export function getPoemDetail(id) {
  return poemDao.findPoemById(id) || null;
}

/**
 * 随机获取一首诗词
 * @returns {Object|null}
 */
export function getRandomPoem() {
  return poemDao.findRandomPoem() || null;
}

/**
 * 将用户输入格式化为 FTS5 查询语句
 * 转义特殊字符，使用双引号包裹做精确匹配
 * @param {string} keyword - 用户搜索关键词
 * @returns {string} FTS5 查询字符串
 */
function buildFtsQuery(keyword) {
  // 转义 FTS5 特殊字符
  const escaped = keyword.replace(/['"(){}*^~]/g, '').trim();
  if (!escaped) return '""';
  // 使用双引号包裹做精确短语匹配
  return `"${escaped}"`;
}

/**
 * 判定搜索结果的匹配字段
 * 检查关键词出现在 title/author/content 中的哪个字段
 * @param {Object} row - FTS 查询结果行
 * @param {string} keyword - 原始搜索关键词
 * @returns {string} 匹配字段名称
 */
function detectMatchField(row, keyword) {
  if (row.title && row.title.includes(keyword)) return 'title';
  if (row.author && row.author.includes(keyword)) return 'author';
  return 'content';
}

/**
 * 关键词搜索诗词
 * 支持繁简自动转换：用户输入简体关键词时，自动转为繁体后再进行 FTS5 搜索
 * @param {Object} query - 请求参数 { q, page, pageSize }
 * @returns {{ list: Array, total: number, page: number, pageSize: number, originalKeyword: string }}
 */
export function searchPoems(query) {
  const keyword = (query.q || '').trim();
  if (!keyword) {
    return { list: [], total: 0, page: 1, pageSize: 20, originalKeyword: '' };
  }

  const page = Math.max(1, parseInt(query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(query.pageSize) || 20));
  const offset = (page - 1) * pageSize;

  // 将简体关键词转换为繁体（数据库中的数据为繁体）
  // s2tConverter 是一个函数，直接调用即可转换
  const traditionalKeyword = s2tConverter(keyword);

  const ftsQuery = buildFtsQuery(traditionalKeyword);
  const { list, total } = poemDao.searchPoems(ftsQuery, pageSize, offset);

  // 为每条结果添加 matchField 标识（使用繁体关键词匹配繁体数据）
  const enrichedList = list.map(row => ({
    ...row,
    matchField: detectMatchField(row, traditionalKeyword),
  }));

  // 按匹配优先级排序：title > author > content
  const priority = { title: 1, author: 2, content: 3 };
  enrichedList.sort((a, b) => (priority[a.matchField] || 3) - (priority[b.matchField] || 3));

  return {
    list: enrichedList,
    total,
    page,
    pageSize,
    // 保留用户原始输入，供前端高亮使用
    originalKeyword: keyword,
  };
}

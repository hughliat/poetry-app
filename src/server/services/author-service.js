/**
 * 作者业务逻辑层
 * 负责作者列表查询与数据格式化
 */
import * as authorDao from '../dao/author-dao.js';

/**
 * 获取作者列表
 * @param {Object} query - 请求参数
 * @param {string} [query.dynasty] - 朝代名称（可选筛选）
 * @returns {Array} 作者列表
 */
export function getAuthorList(query) {
  const { dynasty } = query;
  return authorDao.findAuthors(dynasty || undefined);
}

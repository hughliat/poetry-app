/**
 * 数据清洗模块
 * 负责字段映射统一、过滤无效记录、去重处理
 */

// 预定义的有效朝代列表（按历史顺序）
const VALID_DYNASTIES = [
  '先秦', '汉', '魏晋', '南北朝', '隋', '唐', '五代', '宋', '金', '元', '明', '清', '近现代',
];

// 朝代名称映射（处理数据源中的变体）
const DYNASTY_MAP = {
  '唐代': '唐',
  '宋朝': '宋',
  '宋代': '宋',
  '北宋': '宋',
  '南宋': '宋',
  '明代': '明',
  '清代': '清',
  '元代': '元',
};

/**
 * 统一朝代名称
 * @param {string} dynasty - 原始朝代名称
 * @returns {string|null} 标准化后的朝代名，无效返回 null
 */
export function normalizeDynasty(dynasty) {
  if (!dynasty) return null;
  const trimmed = dynasty.trim();
  // 直接匹配
  if (VALID_DYNASTIES.includes(trimmed)) return trimmed;
  // 映射匹配
  if (DYNASTY_MAP[trimmed]) return DYNASTY_MAP[trimmed];
  // 模糊匹配（如 "唐" 在 "唐代" 中）
  for (const valid of VALID_DYNASTIES) {
    if (trimmed.includes(valid) || valid.includes(trimmed)) return valid;
  }
  return null;
}

/**
 * 唐诗数据清洗与字段映射
 * 原始字段: { title, author, content[], dynasty, id }
 * @param {Object} raw - 原始数据记录
 * @param {string} source - 数据来源标识
 * @returns {Object|null} 清洗后的记录，无效返回 null
 */
export function cleanTangPoem(raw, source = 'tangshi') {
  if (!raw) return null;

  const title = (raw.title || '').trim();
  const author = (raw.author || '').trim();
  const dynasty = normalizeDynasty(raw.dynasty || '唐');

  // 处理 content：可能是数组或字符串
  let content = '';
  if (Array.isArray(raw.content)) {
    content = raw.content.join('\n').trim();
  } else if (typeof raw.content === 'string') {
    content = raw.content.trim();
  } else if (Array.isArray(raw.paragraphs)) {
    content = raw.paragraphs.join('\n').trim();
  }

  // 过滤无效记录
  if (!title || !author || !content || !dynasty) return null;

  // 生成唯一 ID
  const id = raw.id ? `${source}-${raw.id}` : `${source}-${title}-${author}`.substring(0, 80);

  return {
    id,
    title,
    author,
    dynasty,
    content,
    category: raw.category || '',
    annotation: raw.annotation || '',
    source,
  };
}

/**
 * 宋词数据清洗与字段映射
 * 原始字段: { rhythmic, author, paragraphs[], dynasty, id }
 * @param {Object} raw - 原始数据记录
 * @param {string} source - 数据来源标识
 * @returns {Object|null} 清洗后的记录，无效返回 null
 */
export function cleanSongCi(raw, source = 'songci') {
  if (!raw) return null;

  // 宋词中 rhythmic 是词牌名，作为标题
  const title = (raw.rhythmic || raw.title || '').trim();
  const author = (raw.author || '').trim();
  const dynasty = normalizeDynasty(raw.dynasty || '宋');

  // 处理 paragraphs/content：可能是数组或字符串
  let content = '';
  if (Array.isArray(raw.paragraphs)) {
    content = raw.paragraphs.join('\n').trim();
  } else if (typeof raw.paragraphs === 'string') {
    content = raw.paragraphs.trim();
  } else if (Array.isArray(raw.content)) {
    content = raw.content.join('\n').trim();
  }

  // 过滤无效记录
  if (!title || !author || !content || !dynasty) return null;

  // 生成唯一 ID
  const id = raw.id ? `${source}-${raw.id}` : `${source}-${title}-${author}`.substring(0, 80);

  return {
    id,
    title,
    author,
    dynasty,
    content,
    category: title, // 词牌名即为分类
    annotation: raw.annotation || '',
    source,
  };
}

/**
 * 通用数据清洗入口
 * 根据来源自动选择清洗函数
 * @param {Object} raw - 原始数据
 * @param {string} source - 数据来源
 * @returns {Object|null}
 */
export function cleanRecord(raw, source) {
  if (source.startsWith('tang') || source.startsWith('唐诗')) {
    return cleanTangPoem(raw, source);
  }
  if (source.startsWith('song') || source.startsWith('宋词')) {
    return cleanSongCi(raw, source);
  }
  // 默认尝试唐诗格式
  return cleanTangPoem(raw, source);
}

/**
 * 创建去重器
 * 使用 title + author 组合作为去重键
 * @returns {{ add: (record) => boolean, seen: Set }}
 */
export function createDeduplicator() {
  const seen = new Set();
  return {
    /**
     * 尝试添加记录，返回 true 表示新记录，false 表示重复
     */
    add(record) {
      if (!record) return false;
      const key = `${record.title}|${record.author}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    },
    seen,
  };
}

export { VALID_DYNASTIES };

/**
 * 数据导入主脚本（ETL 流程）
 * 实现开发设计第 6.3 节的 10 步导入流程
 * 执行命令: npm run init-data
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

import { downloadDataset, getDatasetDir } from './download-data.js';
import { cleanTangPoem, cleanSongCi, createDeduplicator } from './data-cleaner.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 数据库文件路径
const DB_DIR = path.resolve(__dirname, '../../../../data');
const DB_PATH = process.env.POETRY_DB_PATH || path.join(DB_DIR, 'poetry.db');

// ========== SQL 定义 ==========

const CREATE_TABLES_SQL = `
  -- 朝代表
  CREATE TABLE IF NOT EXISTS dynasties (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL UNIQUE,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  -- 作者表
  CREATE TABLE IF NOT EXISTS authors (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    dynasty_id INTEGER NOT NULL,
    poem_count INTEGER NOT NULL DEFAULT 0,
    UNIQUE (name, dynasty_id),
    FOREIGN KEY (dynasty_id) REFERENCES dynasties(id)
  );

  -- 诗词主表
  CREATE TABLE IF NOT EXISTS poems (
    id         TEXT    PRIMARY KEY,
    title      TEXT    NOT NULL,
    author_id  INTEGER NOT NULL,
    dynasty_id INTEGER NOT NULL,
    category   TEXT    DEFAULT '',
    content    TEXT    NOT NULL,
    annotation TEXT    DEFAULT '',
    source     TEXT    DEFAULT '',
    FOREIGN KEY (author_id)  REFERENCES authors(id),
    FOREIGN KEY (dynasty_id) REFERENCES dynasties(id)
  );

  -- FTS5 全文搜索虚拟表（独立模式）
  CREATE VIRTUAL TABLE IF NOT EXISTS poem_fts USING fts5(
    poem_id,
    title,
    author,
    content,
    tokenize = 'unicode61'
  );
`;

const CREATE_INDEXES_SQL = [
  'CREATE INDEX IF NOT EXISTS idx_poems_author_id ON poems(author_id)',
  'CREATE INDEX IF NOT EXISTS idx_poems_dynasty_id ON poems(dynasty_id)',
  'CREATE INDEX IF NOT EXISTS idx_poems_category ON poems(category)',
  'CREATE INDEX IF NOT EXISTS idx_poems_title ON poems(title)',
  'CREATE INDEX IF NOT EXISTS idx_authors_dynasty_id ON authors(dynasty_id)',
  'CREATE INDEX IF NOT EXISTS idx_authors_name ON authors(name)',
];

// 朝代排序顺序
const DYNASTY_ORDER = {
  '先秦': 1, '汉': 2, '魏晋': 3, '南北朝': 4, '隋': 5,
  '唐': 6, '五代': 7, '宋': 8, '金': 9, '元': 10,
  '明': 11, '清': 12, '近现代': 13,
};

// ========== 辅助函数 ==========

/**
 * 递归扫描目录下的所有 JSON 文件
 */
function scanJsonFiles(dir, pattern = /\.json$/) {
  const results = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...scanJsonFiles(fullPath, pattern));
    } else if (pattern.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * 读取 JSON 文件，支持数组格式和 JSOND（逐行 JSON）
 */
function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    // 尝试解析为 JSON 数组
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) return parsed;
    return [parsed];
  } catch {
    // 尝试 JSOND 格式（每行一个 JSON 对象）
    try {
      const lines = fs.readFileSync(filePath, 'utf-8').split('\n').filter(l => l.trim());
      return lines.map(line => JSON.parse(line));
    } catch {
      console.warn(`[警告] 无法解析文件: ${filePath}`);
      return [];
    }
  }
}

// ========== 主流程 ==========

async function main() {
  const startTime = Date.now();
  console.log('========================================');
  console.log('  诗词应用 — 数据初始化');
  console.log('========================================\n');

  // ===== Step 1: 检查/下载数据 =====
  console.log('[Step 1] 检查数据目录...');
  let datasetDir;
  try {
    datasetDir = downloadDataset();
  } catch {
    // 如果下载失败，检查是否已有数据
    datasetDir = getDatasetDir();
    if (!fs.existsSync(datasetDir)) {
      console.error('[错误] 数据集下载失败且本地无数据，无法继续');
      process.exit(1);
    }
  }
  console.log(`[Step 1] 数据目录: ${datasetDir}\n`);

  // ===== Step 2: 扫描 JSON 文件 =====
  console.log('[Step 2] 扫描 JSON 文件...');

  // 唐诗数据文件
  const tangDirs = ['唐诗', '全唐诗'];
  const tangFiles = [];
  for (const dir of tangDirs) {
    tangFiles.push(...scanJsonFiles(path.join(datasetDir, dir)));
  }

  // 宋词数据文件
  const songDirs = ['宋词', '全宋词'];
  const songFiles = [];
  for (const dir of songDirs) {
    songFiles.push(...scanJsonFiles(path.join(datasetDir, dir)));
  }

  // 其他可能包含诗词的目录
  const otherDirs = ['五代诗词', '元曲', '诗经', '楚辞', '全元曲'];
  const otherFiles = [];
  for (const dir of otherDirs) {
    otherFiles.push(...scanJsonFiles(path.join(datasetDir, dir)));
  }

  const totalFiles = tangFiles.length + songFiles.length + otherFiles.length;
  console.log(`[Step 2] 唐诗文件: ${tangFiles.length}, 宋词文件: ${songFiles.length}, 其他: ${otherFiles.length}`);
  console.log(`[Step 2] 总计扫描文件: ${totalFiles}\n`);

  // ===== Step 3: 数据清洗 =====
  console.log('[Step 3] 数据清洗...');
  const allRecords = [];
  const dedup = createDeduplicator();
  let skippedFilter = 0;
  let skippedDup = 0;
  let totalScanned = 0;

  // 处理唐诗文件
  for (const file of tangFiles) {
    const rawRecords = readJsonFile(file);
    for (const raw of rawRecords) {
      totalScanned++;
      const cleaned = cleanTangPoem(raw, 'tangshi');
      if (!cleaned) {
        skippedFilter++;
        continue;
      }
      if (!dedup.add(cleaned)) {
        skippedDup++;
        continue;
      }
      allRecords.push(cleaned);
    }
  }

  // 处理宋词文件
  for (const file of songFiles) {
    const rawRecords = readJsonFile(file);
    for (const raw of rawRecords) {
      totalScanned++;
      const cleaned = cleanSongCi(raw, 'songci');
      if (!cleaned) {
        skippedFilter++;
        continue;
      }
      if (!dedup.add(cleaned)) {
        skippedDup++;
        continue;
      }
      allRecords.push(cleaned);
    }
  }

  // 处理其他文件（尝试通用清洗）
  for (const file of otherFiles) {
    const rawRecords = readJsonFile(file);
    for (const raw of rawRecords) {
      totalScanned++;
      // 根据文件路径判断来源
      const isTang = file.includes('五代') ? false : file.includes('唐');
      const cleaned = isTang ? cleanTangPoem(raw, 'other') : cleanSongCi(raw, 'other');
      if (!cleaned) {
        skippedFilter++;
        continue;
      }
      if (!dedup.add(cleaned)) {
        skippedDup++;
        continue;
      }
      allRecords.push(cleaned);
    }
  }

  console.log(`[Step 3] 总扫描: ${totalScanned}, 有效: ${allRecords.length}, 过滤: ${skippedFilter}, 去重: ${skippedDup}\n`);

  // ===== Step 4: 创建数据库表 =====
  console.log('[Step 4] 创建数据库表...');

  // 确保数据目录存在
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  // 删除旧数据库（保证幂等性）
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
    console.log('[Step 4] 已删除旧数据库');
  }

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = OFF'); // 导入期间关闭外键检查以提升性能
  db.pragma('synchronous = OFF');   // 导入期间关闭同步

  // 执行建表语句
  db.exec(CREATE_TABLES_SQL);
  for (const idx of CREATE_INDEXES_SQL) {
    db.exec(idx);
  }
  console.log('[Step 4] 数据库表与索引创建完成\n');

  // ===== Step 5: 导入朝代数据 =====
  console.log('[Step 5] 导入朝代数据...');

  // 从清洗后的数据中提取不重复的朝代
  const dynastySet = new Set(allRecords.map(r => r.dynasty));
  const insertDynasty = db.prepare('INSERT INTO dynasties (name, sort_order) VALUES (@name, @sort_order)');

  const insertDynasties = db.transaction(() => {
    for (const name of dynastySet) {
      const sortOrder = DYNASTY_ORDER[name] || 99;
      insertDynasty.run({ name, sort_order: sortOrder });
    }
  });
  insertDynasties();

  const dynastyCount = db.prepare('SELECT COUNT(*) AS cnt FROM dynasties').get().cnt;
  console.log(`[Step 5] 导入朝代: ${dynastyCount} 个 (${[...dynastySet].join('、')})\n`);

  // ===== Step 6: 导入作者数据 =====
  console.log('[Step 6] 导入作者数据...');

  // 构建朝代名称 -> ID 映射
  const dynastyMap = {};
  for (const row of db.prepare('SELECT id, name FROM dynasties').all()) {
    dynastyMap[row.name] = row.id;
  }

  // 提取不重复作者（name + dynasty 组合）
  const authorKeyMap = new Map(); // key: "name|dynasty" -> record
  for (const record of allRecords) {
    const key = `${record.author}|${record.dynasty}`;
    if (!authorKeyMap.has(key)) {
      authorKeyMap.set(key, {
        name: record.author,
        dynasty_id: dynastyMap[record.dynasty],
      });
    }
  }

  const insertAuthor = db.prepare('INSERT OR IGNORE INTO authors (name, dynasty_id) VALUES (@name, @dynasty_id)');
  const insertAuthors = db.transaction(() => {
    for (const author of authorKeyMap.values()) {
      insertAuthor.run(author);
    }
  });
  insertAuthors();

  const authorCount = db.prepare('SELECT COUNT(*) AS cnt FROM authors').get().cnt;
  console.log(`[Step 6] 导入作者: ${authorCount} 人\n`);

  // 构建作者查询缓存: "name|dynasty_id" -> author_id
  const authorIdCache = new Map();
  for (const row of db.prepare('SELECT id, name, dynasty_id FROM authors').all()) {
    authorIdCache.set(`${row.name}|${row.dynasty_id}`, row.id);
  }

  // ===== Step 7: 导入诗词数据 =====
  console.log('[Step 7] 导入诗词数据...');

  const insertPoem = db.prepare(`
    INSERT OR IGNORE INTO poems (id, title, author_id, dynasty_id, category, content, annotation, source)
    VALUES (@id, @title, @author_id, @dynasty_id, @category, @content, @annotation, @source)
  `);

  const insertFts = db.prepare(`
    INSERT INTO poem_fts (poem_id, title, author, content)
    VALUES (@poem_id, @title, @author, @content)
  `);

  const BATCH_SIZE = 1000;
  let importedPoems = 0;
  let failedPoems = 0;

  const importBatch = db.transaction((batch) => {
    for (const record of batch) {
      const authorKey = `${record.author}|${dynastyMap[record.dynasty]}`;
      const authorId = authorIdCache.get(authorKey);
      if (!authorId) {
        failedPoems++;
        continue;
      }

      try {
        const result = insertPoem.run({
          id: record.id,
          title: record.title,
          author_id: authorId,
          dynasty_id: dynastyMap[record.dynasty],
          category: record.category || '',
          content: record.content,
          annotation: record.annotation || '',
          source: record.source || '',
        });

        // 仅在诗词实际插入时才写入 FTS 索引（避免 INSERT OR IGNORE 跳过的记录）
        if (result.changes > 0) {
          insertFts.run({
            poem_id: record.id,
            title: record.title,
            author: record.author,
            content: record.content,
          });
          importedPoems++;
        } else {
          skippedDup++;
        }
      } catch (err) {
        failedPoems++;
        if (failedPoems <= 5) {
          console.warn(`[警告] 导入失败 (${record.id}): ${err.message}`);
        }
      }
    }
  });

  // 分批导入
  for (let i = 0; i < allRecords.length; i += BATCH_SIZE) {
    const batch = allRecords.slice(i, i + BATCH_SIZE);
    importBatch(batch);
    const progress = Math.min(i + BATCH_SIZE, allRecords.length);
    if (progress % 5000 === 0 || progress === allRecords.length) {
      console.log(`[Step 7] 进度: ${progress}/${allRecords.length}`);
    }
  }

  console.log(`[Step 7] 诗词导入完成: ${importedPoems} 首\n`);

  // ===== Step 8: 更新统计字段 =====
  console.log('[Step 8] 更新作者诗词统计...');

  db.exec(`
    UPDATE authors SET poem_count = (
      SELECT COUNT(*) FROM poems WHERE poems.author_id = authors.id
    )
  `);
  console.log('[Step 8] 统计更新完成\n');

  // ===== Step 9: 输出导入报告 =====
  console.log('[Step 9] 导入验证...');

  const poemTotal = db.prepare('SELECT COUNT(*) AS cnt FROM poems').get().cnt;
  const authorTotal = db.prepare('SELECT COUNT(*) AS cnt FROM authors').get().cnt;
  const dynastyTotal = db.prepare('SELECT COUNT(*) AS cnt FROM dynasties').get().cnt;
  const ftsTotal = db.prepare('SELECT COUNT(*) AS cnt FROM poem_fts').get().cnt;

  // 抽样检查
  const sampleRows = db.prepare(`
    SELECT p.id, p.title, a.name AS author, d.name AS dynasty
    FROM poems p
    JOIN authors a ON p.author_id = a.id
    JOIN dynasties d ON p.dynasty_id = d.id
    ORDER BY RANDOM()
    LIMIT 5
  `).all();

  console.log('\n========== 数据导入报告 ==========');
  console.log(`数据源路径：${datasetDir}`);
  console.log(`扫描文件数：${totalFiles}`);
  console.log(`总记录数：  ${totalScanned.toLocaleString()}`);
  console.log(`成功导入：  ${importedPoems.toLocaleString()}`);
  console.log(`跳过(过滤)：${skippedFilter.toLocaleString()}`);
  console.log(`跳过(去重)：${skippedDup.toLocaleString()}`);
  console.log(`失败：      ${failedPoems.toLocaleString()}`);
  console.log('-----------------------------------');
  console.log(`朝代数：    ${dynastyTotal}`);
  console.log(`作者数：    ${authorTotal.toLocaleString()}`);
  console.log(`诗词数：    ${poemTotal.toLocaleString()}`);
  console.log(`FTS 索引：  ${ftsTotal.toLocaleString()}`);
  console.log('-----------------------------------');
  console.log('抽样检查:');
  for (const row of sampleRows) {
    console.log(`  - [${row.dynasty}] ${row.author}《${row.title}》(${row.id})`);
  }
  console.log('===================================\n');

  // 验证通过条件
  const validations = [
    { name: '诗词总数 >= 10,000', pass: poemTotal >= 10000, value: poemTotal },
    { name: '作者总数 >= 1,000', pass: authorTotal >= 1000, value: authorTotal },
    { name: '朝代总数 >= 2', pass: dynastyTotal >= 2, value: dynastyTotal },
    { name: 'FTS 索引与诗词数一致', pass: ftsTotal === poemTotal, value: `${ftsTotal}/${poemTotal}` },
  ];

  let allPass = true;
  for (const v of validations) {
    const status = v.pass ? 'PASS' : 'FAIL';
    console.log(`  [${status}] ${v.name} (实际: ${v.value})`);
    if (!v.pass) allPass = false;
  }

  // ===== Step 10: 完成 =====
  db.close();

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  if (allPass) {
    console.log(`\n数据初始化完成，共导入 ${poemTotal.toLocaleString()} 首诗词 (耗时 ${elapsed}s)`);
  } else {
    console.log(`\n数据初始化完成，但部分验证未通过，请检查上方报告`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('[致命错误]', err);
  process.exit(1);
});

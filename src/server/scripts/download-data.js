/**
 * 数据集下载脚本
 * 使用 git clone --depth 1 浅克隆 chinese-poetry 数据集
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 数据集存放路径
const DATA_DIR = path.resolve(__dirname, '../../../../data');
const DATASET_DIR = path.join(DATA_DIR, 'chinese-poetry');
const REPO_URL = 'https://github.com/chinese-poetry/chinese-poetry.git';

/**
 * 检查数据集是否已存在
 * @returns {boolean}
 */
export function isDatasetDownloaded() {
  return fs.existsSync(DATASET_DIR) && fs.existsSync(path.join(DATASET_DIR, '唐诗'));
}

/**
 * 下载数据集（浅克隆）
 * @returns {string} 数据集目录路径
 */
export function downloadDataset() {
  // 确保 data 目录存在
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (isDatasetDownloaded()) {
    console.log('[下载] 数据集已存在，跳过下载');
    return DATASET_DIR;
  }

  // 如果目录存在但不完整（如之前下载失败），先清理
  if (fs.existsSync(DATASET_DIR)) {
    fs.rmSync(DATASET_DIR, { recursive: true, force: true });
  }

  console.log('[下载] 开始克隆 chinese-poetry 数据集（浅克隆）...');
  console.log(`[下载] 目标目录: ${DATASET_DIR}`);

  try {
    execSync(`git clone --depth 1 ${REPO_URL} "${DATASET_DIR}"`, {
      stdio: 'inherit',
      timeout: 300000, // 5 分钟超时
    });
    console.log('[下载] 数据集克隆完成');
  } catch (err) {
    console.error('[下载] 克隆失败:', err.message);
    console.error('[下载] 请手动执行: git clone --depth 1 ' + REPO_URL + ' ' + DATASET_DIR);
    throw err;
  }

  return DATASET_DIR;
}

/**
 * 获取数据集目录路径
 */
export function getDatasetDir() {
  return DATASET_DIR;
}

// 直接执行时运行下载
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  downloadDataset();
}

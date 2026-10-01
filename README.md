# 诗词天地 (Poetry App)

中国古典诗词阅读与搜索 Web 应用，收录 **314,629 首**诗词（唐诗 304,532 + 宋词 10,097），涵盖 **13,887 位**作者。

## 在线演示

- 前端：https://hughliat.github.io/poetry-app/
- 后端 API：https://poetry-app-api.xxx（部署后补充）

## 功能特性

### 核心功能
- **诗词浏览** — 按朝代、作者、诗体/词牌分类浏览，支持分页
- **关键词搜索** — 标题/作者/正文全文检索，FTS5 索引，平均响应 14ms
- **诗词详情** — 完整展示标题、作者、朝代、正文，古典风格排版
- **随机推荐** — 一键发现随机诗词，支持"换一首"

### 二期增强（v2.0.0）
- **繁简切换** — 导航栏一键切换繁体/简体，前端 opencc-js 本地转换
- **搜索优化** — 关键词高亮修复，三级匹配策略（原始→繁体→放弃）
- **移动端适配** — 4 级响应式断点（桌面/平板/手机/小屏），汉堡菜单
- **诗词收藏** — localStorage 轻量收藏，无需注册，一键收藏/取消
- **自动化测试** — Vitest + Supertest，35 个测试用例覆盖 7 个 API

## 技术栈

| 层级 | 技术 |
|---|---|
| 前端 | Vue 3 + Vite + Vue Router + 原生 CSS（古典风格） |
| 后端 | Node.js + Express |
| 数据库 | SQLite（better-sqlite3）+ FTS5 全文索引 |
| 繁简转换 | opencc-js |
| 测试 | Vitest + Supertest |
| 数据源 | [chinese-poetry](https://github.com/chinese-poetry/chinese-poetry)（CC0/公有领域） |

## 快速启动

### 环境要求

- Node.js >= 18
- npm >= 8

### 安装与运行

```bash
# 克隆仓库
git clone https://github.com/hughliat/poetry-app.git
cd poetry-app

# 安装依赖
npm run install:all

# 初始化数据（首次运行需要，将 JSON 数据导入 SQLite，约 304MB）
npm run init-data

# 启动开发服务器
npm run dev
# 前端：http://localhost:5173
# 后端：http://localhost:3000
```

### 运行测试

```bash
npm test
# 35 passed / 0 failed
```

### 构建生产版本

```bash
npm run build        # 构建前端到 src/client/dist/
npm start            # 以生产模式启动后端
```

## 项目结构

```
poetry-app/
├── AGENT.md                    # 项目规则
├── package.json                # 根脚本（install:all / dev / build / test）
├── docs/                       # 项目文档
│   ├── 00-总控计划.md          # 一期进度看板
│   ├── 00-总控计划-v2.md       # 二期进度看板
│   ├── 01-总体方案.md          # 一期总体方案
│   ├── 01-总体方案-v2.md       # 二期总体方案
│   ├── 02-PRD.md               # 一期需求文档
│   ├── 02-PRD-v2.md            # 二期需求文档
│   ├── 03-开发设计.md          # 一期开发设计
│   ├── 03-开发设计-v2.md       # 二期开发设计
│   ├── 04-测试报告.md          # 一期测试报告
│   ├── 04-测试报告-v2.md       # 二期测试报告
│   ├── 05-发布说明.md          # 一期发布说明（v1.0.0）
│   ├── 05-发布说明-v2.md       # 二期发布说明（v2.0.0）
│   ├── 06-运维手册.md          # 一期运维手册
│   └── 06-运维手册-v2.md       # 二期运维手册
├── src/
│   ├── client/                 # 前端（Vue 3 + Vite）
│   │   ├── api/                # API 封装
│   │   ├── components/         # 通用组件（nav-bar / poem-card / pagination 等）
│   │   ├── composables/        # Vue 组合式函数（useScriptMode / useFavorites）
│   │   ├── styles/             # 全局样式（variables / reset / base / responsive）
│   │   ├── utils/              # 工具函数（converter / storage）
│   │   └── views/              # 页面组件（home / browse / search / detail / favorites）
│   └── server/                 # 后端（Node.js + Express）
│       ├── db/                 # 数据库连接
│       ├── dao/                # 数据访问层
│       ├── services/           # 业务逻辑层
│       ├── routes/             # 路由层
│       ├── tests/              # 自动化测试（35 个用例）
│       ├── scripts/            # 数据导入脚本
│       ├── app.js              # Express 应用
│       └── start.js            # 启动入口
└── data/                       # 数据目录（.gitignore 排除）
    └── poetry.db               # SQLite 数据库（304MB）
```

## API 文档

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/poems` | 诗词列表（分页、朝代/作者筛选） |
| GET | `/api/poems/:id` | 诗词详情 |
| GET | `/api/poems/random` | 随机推荐 |
| GET | `/api/poems/search?q=keyword` | 关键词搜索（支持繁简） |
| GET | `/api/authors` | 作者列表 |
| GET | `/api/dynasties` | 朝代列表 |
| GET | `/api/categories` | 分类列表（诗体/词牌） |

## 版本历史

| 版本 | 日期 | 说明 |
|---|---|---|
| v2.0.0 | 2026-10-01 | 繁简切换、搜索优化、移动端适配、收藏功能、自动化测试 |
| v1.0.0 | 2026-10-01 | MVP：浏览、搜索、详情、随机推荐 |

## 许可证

本项目代码采用 MIT 许可证。诗词数据来源于 [chinese-poetry](https://github.com/chinese-poetry/chinese-poetry)（CC0/公有领域）。

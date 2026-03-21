# SharedBlacklist

去中心化公共黑名单平台。基于 Vue 3 + Gun.js（P2P 实时数据库）构建，前端部署在 IPFS 上，数据通过 Gun relay 节点在用户间实时同步。

## 功能特性

- **黑名单公示** — 已审核通过的举报信息以卡片形式展示，支持按时间排序
- **访客举报** — 任何人可提交举报（姓名、行为描述、严重程度、备注、截图），提交后进入待审核队列
- **截图上传** — 通过 relay 代理上传截图到 imgloc 图床，绕过 CORS 限制
- **管理员审核** — 管理员通过 Gun SEA 用户系统登录，可审核通过、拒绝或移除条目
- **密码学签名** — 审核通过的条目附带管理员签名，客户端验证签名确保数据可信
- **P2P 数据同步** — 基于 Gun.js 的去中心化架构，数据在所有连接节点间实时同步
- **Relay 连接状态** — 底部状态栏实时显示 relay 连接状态和节点数
- **IPFS 兼容** — 所有资源路径为相对路径，可直接部署到 IPFS

## 技术栈

| 类别 | 技术 |
|------|------|
| 前端框架 | Vue 3 (Composition API) |
| 构建工具 | Vite 5 |
| 数据库 | Gun.js (P2P + IndexedDB 本地持久化) |
| 加密认证 | Gun SEA (签名/验证) |
| Relay 服务器 | Express + Gun |
| 前端部署 | IPFS (通过 PinMe) |
| Relay 部署 | HuggingFace Spaces (Docker) |
| CI/CD | GitHub Actions |

## 目录结构

```
SharedBlacklist/
├── index.html                    # 入口 HTML
├── package.json                  # 依赖配置 (Vue 3 + Gun.js)
├── vite.config.js                # Vite 配置 (base: './' IPFS 兼容)
├── src/
│   ├── main.js                   # 应用入口
│   ├── App.vue                   # 根组件
│   ├── constants/
│   │   ├── admin.js              # 管理员公钥 + 别名
│   │   └── gun.js                # Relay 地址 + 数据库命名空间
│   ├── lib/
│   │   ├── gun.js                # Gun 实例初始化 (peers + IndexedDB)
│   │   ├── sea.js                # SEA 认证/签名/验证封装
│   │   ├── id-generator.js       # 时间戳+随机hex ID 生成
│   │   └── imgloc.js             # 图片上传工具
│   ├── composables/
│   │   ├── useBlacklist.js       # 订阅 approved 节点 + 签名验证
│   │   ├── usePending.js         # 订阅 pending 节点 (管理员用)
│   │   ├── useSubmission.js      # 访客提交举报逻辑
│   │   ├── useAdmin.js           # 管理员登录/审核/拒绝/移除
│   │   └── useRelayStatus.js     # Relay 连接状态轮询
│   ├── components/
│   │   ├── AppHeader.vue         # 顶部导航 + 管理员入口
│   │   ├── AppFooter.vue         # 底部状态栏 (连接状态)
│   │   ├── BlacklistGrid.vue     # 黑名单卡片网格
│   │   ├── BlacklistCard.vue     # 单条黑名单卡片
│   │   ├── RemarkModal.vue       # 备注详情弹窗
│   │   ├── SubmitButton.vue      # 悬浮提交按钮
│   │   ├── SubmitModal.vue       # 提交举报表单弹窗
│   │   ├── AdminLogin.vue        # 管理员登录弹窗
│   │   ├── AdminPanel.vue        # 管理员审核面板
│   │   ├── ReviewCard.vue        # 待审核条目卡片
│   │   ├── StarRating.vue        # 严重程度星级组件
│   │   └── BaseModal.vue         # 通用弹窗基础组件
│   ├── styles/
│   │   └── main.css              # 全局样式
│   └── utils/
│       ├── severity.js           # 严重程度 → 颜色映射
│       └── validators.js         # 表单校验
├── relay/                        # Gun relay 服务器
│   ├── server.js                 # Express + Gun relay + 图片上传代理
│   ├── package.json
│   ├── Dockerfile                # HuggingFace Spaces 部署用
│   └── render.yaml               # Render 部署配置
└── .github/
    └── workflows/
        └── deploy.yml            # GitHub Actions 自动部署 + relay 保活
```

## 数据流

```
访客提交举报 → Gun "pending" 节点
                    ↓
          管理员审核 (SEA 签名)
           ↓              ↓
     审核通过             拒绝
  签名 + 写入           从 pending 删除
  "approved" 节点
       ↓
  客户端验证签名 → 展示在黑名单列表
```

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## Relay 服务器

```bash
cd relay
npm install
npm start    # 默认端口 8765，可通过 PORT 环境变量修改
```

Relay 提供两个功能：
1. Gun.js WebSocket 中继 — 实现客户端间 P2P 数据同步
2. 图片上传代理 (`POST /api/upload`) — 转发到 imgloc.com 绕过浏览器 CORS

## 部署

前端通过 PinMe 部署到 IPFS，Relay 部署到 HuggingFace Spaces。详见：

- [PINME_DEPLOY.md](./PINME_DEPLOY.md) — PinMe + GitHub Actions 自动部署指南
- [DEPLOY_GUIDE.md](./DEPLOY_GUIDE.md) — Relay 服务器部署指南 (HuggingFace / Render)

## 首次部署配置

1. **生成管理员密钥对**：启动 dev server 后在浏览器控制台创建管理员账户，获取公钥
2. **配置公钥**：将公钥写入 `src/constants/admin.js` 的 `ADMIN_PUB_KEY`
3. **部署 Relay**：将 `relay/` 部署到 HuggingFace Spaces
4. **配置 Relay 地址**：将 relay URL 写入 `src/constants/gun.js`
5. **部署前端**：`npm run build` → 通过 PinMe 上传 `dist/` 到 IPFS

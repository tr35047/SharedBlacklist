SharedBlacklist — 实施完成                                                                                                                            
 ──────────────────────────────────────────────────────────────────────
  项目结构（全部文件已创建）                                                                                            
  基础配置
  - package.json — Vite 5 + Vue 3 + Gun.js 依赖
  - vite.config.js — base: './' 确保 IPFS 兼容
  - index.html — 入口 HTML

  核心模块 (src/)
  - constants/admin.js — 管理员公钥占位（首次部署时替换）
  - constants/gun.js — Relay 地址配置
  - lib/gun.js — Gun 实例初始化 + IndexedDB 持久化
  - lib/sea.js — SEA 认证/签名/验证工具
  - lib/id-generator.js — 时间戳+随机hex 防碰撞 ID
  - utils/severity.js — 严重程度 → HSL 颜色映射
  - utils/validators.js — 表单校验

  Composables
  - useBlacklist.js — 订阅 approved 节点 + 签名验证过滤
  - usePending.js — 订阅 pending 节点
  - useSubmission.js — 访客提交举报逻辑
  - useAdmin.js — 管理员登录/审核/拒绝/移除
  - useRelayStatus.js — Relay 连接状态监控

  组件（12个）
  - BaseModal / StarRating — 基础 UI
  - BlacklistGrid / BlacklistCard / RemarkModal — 公示展示
  - SubmitButton / SubmitModal — 访客提交
  - AdminLogin / AdminPanel / ReviewCard — 管理员审核
  - AppHeader / AppFooter — 布局 + 状态指示

  Relay 服务器 (deploy/relay/)
  - server.js — Gun relay 中继服务器，支持 CORS

  构建验证

  - npm run build 成功，产出 dist/ 约 182KB (gzip ~70KB)
  - 所有资源路径均为 ./ 相对路径，IPFS 兼容

  下一步

  1. 生成管理员密钥对：npm run dev 后在浏览器控制台运行 gun.user().create('blacklist-admin', '你的密码') 获取公钥
  2. 填入公钥：将公钥写入 src/constants/admin.js 的 ADMIN_PUB_KEY
  3. 部署 Relay：cd deploy/relay && npm install && npm start，部署到 Fly.io/Railway
  4. 更新 Relay 地址：将自建 relay URL 添加到 src/constants/gun.js
  5. Pin 到 IPFS：npm run build → 上传 dist/ 到 Pinata
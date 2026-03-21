# SharedBlacklist — PinMe + GitHub Actions 自动部署指南

## 概述

使用 [PinMe](https://github.com/glitternetwork/pinme) 将前端构建产物自动部署到 IPFS，并通过 ENS 域名访问。结合 GitHub Actions 实现：

1. **自动部署**：推送到 `main` 分支时自动构建并发布到 IPFS
2. **定时保活**：每 6 小时 ping 一次 HuggingFace Spaces 上的 Gun relay，防止 48h 休眠

---

## 前置准备

### 1. 安装 PinMe 并获取 AppKey

```bash
# 全局安装 PinMe CLI
npm install -g pinme

# 设置 AppKey（首次使用时会引导你注册/登录）
pinme set-appkey

# 查看当前 AppKey 信息
pinme show-appkey
```

### 2. 准备 ENS 域名（可选）

- 如果你有 `.eth` 域名，可直接绑定
- 如果没有，PinMe 提供免费的 `.pinit.eth.limo` 子域名

### 3. 本地测试部署

```bash
# 先构建项目
npm run build

# 上传 dist 目录到 IPFS（不绑定域名，仅测试）
pinme upload dist

# 上传并绑定到域名
pinme upload dist --domain "你的域名"
```

上传成功后，PinMe 会返回 IPFS CID 和访问链接。

---

## GitHub Actions 配置

### 第一步：设置 GitHub Secrets

在你的 GitHub 仓库中，进入 **Settings → Secrets and variables → Actions → New repository secret**，添加以下 Secrets：

| Secret 名称 | 值 | 说明 |
|---|---|---|
| `PINME_APPKEY` | 你的 PinMe AppKey | 通过 `pinme show-appkey` 查看 |
| `PINME_DOMAIN` | 你的域名（如 `sharedblacklist.eth`） | 可选，不绑定域名则不需要 |
| `RELAY_URL` | `https://你的用户名-shared-blacklist-relay.hf.space` | HuggingFace Spaces 上的 relay 地址 |

---

### 第二步：创建 Workflow 文件

在项目根目录创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to IPFS & Keep Relay Alive

on:
  # 推送到 main 分支时自动部署
  push:
    branches: [main]

  # 支持手动触发部署
  workflow_dispatch:
    inputs:
      domain:
        description: 'PinMe domain name (留空则使用 secrets 中的默认值)'
        required: false

  # 每 6 小时定时执行（用于 relay 保活）
  schedule:
    - cron: '0 */6 * * *'

jobs:
  # ============================================
  # Job 1: 构建并部署到 IPFS（仅 push/手动触发时执行）
  # ============================================
  deploy:
    runs-on: ubuntu-latest
    if: github.event_name == 'push' || github.event_name == 'workflow_dispatch'

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build project
        run: npm run build

      - name: Install PinMe CLI
        run: npm install -g pinme

      - name: Set PinMe AppKey
        run: pinme set-appkey "${{ secrets.PINME_APPKEY }}"

      - name: Upload to IPFS
        run: |
          DOMAIN="${{ github.event.inputs.domain || secrets.PINME_DOMAIN }}"
          if [ -n "$DOMAIN" ]; then
            pinme upload dist --domain "$DOMAIN"
          else
            pinme upload dist
          fi

  # ============================================
  # Job 2: Ping relay 保活（所有触发方式都执行）
  # ============================================
  keep-alive:
    runs-on: ubuntu-latest

    steps:
      - name: Ping HuggingFace Relay
        run: |
          echo "Pinging relay at $(date -u)"
          HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${{ secrets.RELAY_URL }}" || echo "000")
          echo "Response status: $HTTP_STATUS"
          if [ "$HTTP_STATUS" -ge 200 ] && [ "$HTTP_STATUS" -lt 400 ]; then
            echo "✅ Relay is alive"
          elif [ "$HTTP_STATUS" = "000" ]; then
            echo "⚠️ Relay unreachable (may be waking up from sleep)"
          else
            echo "⚠️ Relay returned status $HTTP_STATUS"
          fi
```

---

### 第三步：推送并验证

```bash
# 创建 workflow 目录
mkdir -p .github/workflows

# 将上面的 YAML 内容保存到 .github/workflows/deploy.yml 后
git add .github/workflows/deploy.yml
git commit -m "add: PinMe auto deploy + relay keep-alive"
git push origin main
```

推送后：
1. 进入 GitHub 仓库 → **Actions** 标签页
2. 应该能看到 "Deploy to IPFS & Keep Relay Alive" workflow 正在运行
3. `deploy` job 执行构建和 IPFS 上传
4. `keep-alive` job 执行 relay ping

---

## Workflow 行为说明

| 触发方式 | deploy（构建+部署） | keep-alive（relay 保活） |
|---|---|---|
| `push` 到 main | ✅ 执行 | ✅ 执行 |
| 手动 `workflow_dispatch` | ✅ 执行 | ✅ 执行 |
| 定时 `schedule`（每6h） | ❌ 跳过 | ✅ 执行 |

---

## PinMe 常用命令速查

```bash
# 查看上传历史
pinme list

# 查看绑定的域名
pinme my-domains

# 删除/取消固定某次上传
pinme rm <IPFS_CID>

# 导出为 CAR 文件（备份）
pinme export <IPFS_CID>

# 导入 CAR 文件
pinme import ~/Downloads/<CID>.car
```

---

## PinMe 免费额度

| 限制项 | 额度 |
|---|---|
| 单文件大小 | 200 MB |
| 总存储空间 | 1 GB |
| 免费子域名 | `.pinit.eth.limo` |

---

## 访问方式

部署成功后，可以通过以下方式访问你的站点：

| 方式 | URL 格式 |
|---|---|
| ENS 域名 | `https://你的域名.eth.limo` |
| PinMe 子域名 | `https://你的子域名.pinit.eth.limo` |
| IPFS 网关 | `https://ipfs.io/ipfs/<CID>` |

---

## 常见问题

| 问题 | 解决方案 |
|---|---|
| `pinme set-appkey` 报错 | 确认网络连接正常，AppKey 正确 |
| GitHub Actions 部署失败 | 检查 Secrets 是否正确设置，查看 Actions 日志 |
| 定时任务没有执行 | GitHub 可能会延迟 schedule 任务，属正常现象 |
| Relay ping 返回 000 | Relay 可能正在休眠唤醒中，下次 ping 通常正常 |
| IPFS 内容访问慢 | IPFS 网关首次访问需要传播时间，之后会加速 |
| 超出免费额度 | 用 `pinme rm` 清理不需要的历史版本 |

---

## 与现有部署流程的关系

本指南仅涉及**前端**的 IPFS 部署。**Gun relay 服务器**仍按 `DEPLOY_GUIDE.md` 中的方案部署到 HuggingFace Spaces 或 Render，本 workflow 中的 `keep-alive` job 负责对 relay 进行定时保活。

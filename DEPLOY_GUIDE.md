# SharedBlacklist — 部署自建 Gun Relay 操作指南

## 背景

项目需要一个 Gun relay 服务器来实现用户间数据同步。本文提供两种部署方案：

| 方案 | 需信用卡 | 休眠机制 | 推荐场景 |
|------|---------|---------|---------|
| **方案 A：HuggingFace Spaces** | 否 | 48h 无流量休眠 | 免费、无需信用卡 |
| **方案 B：Render** | 是（需绑卡） | 15min 无请求休眠 | 部署体验好 |

---

## 方案 A：HuggingFace Spaces（推荐）

使用 HuggingFace Spaces 的 Docker 模式部署 Gun relay，完全免费且无需信用卡。

### 第一步：注册 HuggingFace 账号

1. 打开 https://huggingface.co
2. 点击 **Sign Up**，使用邮箱或 GitHub 账号注册
3. 无需信用卡

---

### 第二步：创建 Space

1. 登录后，点击右上角头像 → **New Space**
2. 填写配置：

| 配置项 | 值 |
|--------|-----|
| **Space name** | `shared-blacklist-relay`（或你喜欢的名称） |
| **License** | 任意（如 MIT） |
| **Space SDK** | **Docker** |
| **Docker Template** | **Blank** |
| **Space Hardware** | **CPU basic - 2 vCPU - 16GB - FREE** |
| **Visibility** | Public |

3. 点击 **Create Space**

---

### 第三步：上传 relay 代码

方法一：通过 Git 推送（推荐）

```bash
# 克隆 HuggingFace Space 仓库
git clone https://huggingface.co/spaces/你的用户名/shared-blacklist-relay
cd shared-blacklist-relay

# 复制 relay 目录下的文件
cp /path/to/SharedBlacklist/relay/Dockerfile .
cp /path/to/SharedBlacklist/relay/server.js .
cp /path/to/SharedBlacklist/relay/package.json .

# 推送到 HuggingFace
git add .
git commit -m "deploy gun relay"
git push
```

方法二：通过网页上传

1. 在 Space 页面点击 **Files** 标签
2. 点击 **+ Add file** → **Upload files**
3. 上传 `relay/` 目录中的以下三个文件：
   - `Dockerfile`
   - `server.js`
   - `package.json`
4. 点击 **Commit changes**

---

### 第四步：等待构建完成

HuggingFace 会自动检测 Dockerfile 并开始构建：

1. 在 Space 页面可以查看构建日志
2. 状态从 **Building** → **Running** 即表示部署成功
3. 构建通常需要 1-3 分钟

---

### 第五步：验证 relay 是否正常运行

部署成功后，你的 relay 地址为：

```
https://你的用户名-shared-blacklist-relay.hf.space
```

在浏览器访问该地址，如果看到 **"Gun relay is running"**，说明部署成功。

---

### 第六步：更新前端代码中的 relay 地址

打开文件 `src/constants/gun.js`，将 relay 地址替换为你的 HuggingFace Space 地址：

```js
// 修改为你的实际地址
'https://AB10001-SharedBlacklistRelay.hf.space/gun',
```

---

### 第七步：重新构建前端并验证

```bash
npm run build
```

打开应用，检查浏览器开发者工具 Console：
- 不再出现 WebSocket 连接失败的错误
- 多用户之间数据能正常同步

---

### HuggingFace Spaces 注意事项

**关于休眠**：
- 免费 Space 在 **48 小时无流量后会自动休眠**
- 有人访问时会自动唤醒，冷启动约 **30-60 秒**
- 可通过 [UptimeRobot](https://uptimerobot.com)（免费）设置每 30 分钟 ping 一次来保活

**后续维护**：

| 场景 | 操作 |
|------|------|
| 更新 relay 代码 | 推送到 HuggingFace Space 仓库，自动重新构建 |
| 查看运行状态 | Space 页面顶部状态指示灯 |
| 查看日志 | Space 页面 → **Logs** 标签 |
| 手动重启 | Space 页面 → **Settings** → **Factory reboot** |

**费用说明**：
- 完全免费，无需信用卡
- 2 vCPU + 16GB 内存（对 Gun relay 绰绰有余）
- 无带宽限制

**常见问题**：

| 问题 | 解决方案 |
|------|---------|
| 构建失败 | 检查 Dockerfile 是否正确上传，查看 Build 日志 |
| 访问返回 502 | 确认 Dockerfile 中 PORT 设为 7860 |
| WebSocket 连接不上 | 确认前端使用 `https://` 协议和正确的地址 |
| Space 休眠后连不上 | 正常现象，等待约 30-60 秒自动唤醒 |

---

---

## 方案 B：Render（备选）

> 注意：Render 目前需要绑定信用卡才能使用。

### 第一步：注册 Render 账号

1. 打开 https://render.com
2. 点击 **Get Started for Free**
3. 推荐使用 **GitHub 账号登录**（后续部署更方便）

---

### 第二步：将 relay 代码推送到 GitHub

Render 从 GitHub 仓库拉取代码部署。如果你的项目还没有推送到 GitHub：

```bash
git init
git add .
git commit -m "add gun relay server"
git remote add origin https://github.com/你的用户名/SharedBlacklist.git
git push -u origin main
```

如果已经在 GitHub 上，只需确保最新代码已推送即可。

---

### 第三步：在 Render 上创建服务

1. 登录 Render Dashboard → 点击 **New** → **Web Service**
2. 连接你的 GitHub 仓库（`SharedBlacklist`）
3. 填写配置：

| 配置项 | 值 |
|--------|-----|
| **Name** | `shared-blacklist-relay`（或你喜欢的名称） |
| **Region** | `Singapore (Southeast Asia)` 或离你最近的区域 |
| **Root Directory** | `relay` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Instance Type** | **Free** |

4. 点击 **Create Web Service**

Render 会自动构建并部署，等待几分钟即可完成。

---

### 第四步：验证 relay 是否正常运行

部署完成后，Render 会分配一个地址，格式为：

```
https://你的服务名.onrender.com
```

在浏览器访问该地址，如果看到 **"Gun relay is running"**，说明部署成功。

---

### 第五步：更新前端代码中的 relay 地址

打开文件 `src/constants/gun.js`，将地址替换为你实际的 Render 地址：

```js
// 修改前
'https://shared-blacklist-relay.onrender.com/gun',

// 修改后（替换为你的实际服务名）
'https://你的服务名.onrender.com/gun',
```

---

### 第六步：重新构建前端并验证

```bash
npm run build
```

打开应用，检查浏览器开发者工具 Console：
- 不再出现 WebSocket 连接失败的错误
- 多用户之间数据能正常同步

---

### Render 注意事项

**关于休眠**：
- Render 免费方案的服务在 **15 分钟无请求后会自动休眠**
- 下次有用户访问时会自动唤醒，冷启动约 **30 秒**
- 唤醒后正常运行，不影响功能

**后续维护**：

| 场景 | 操作 |
|------|------|
| 更新 relay 代码 | 推送到 GitHub，Render 自动重新部署 |
| 查看运行状态 | Render Dashboard → 你的服务 → Events |
| 查看日志 | Render Dashboard → 你的服务 → Logs |
| 手动重启 | Render Dashboard → 你的服务 → Manual Deploy → Deploy latest commit |

**费用说明**：
- 需要绑定信用卡
- 750 小时/月免费运行时间（单个服务够用一整个月）
- 100GB 出站带宽/月
- 自动从 GitHub 部署

**常见问题**：

| 问题 | 解决方案 |
|------|---------|
| 部署失败 | 检查 Render Dashboard 的 Events/Logs 页面查看错误信息 |
| Root Directory 设置错误 | 确认填写的是 `relay`（不是 `relay/` 或 `./relay`） |
| 访问地址返回 502 | 查看 Logs，确认 server.js 和 package.json 文件正确 |
| 前端仍然连接失败 | 确认 `gun.js` 中地址正确，使用 `https://` 而非 `http://` |
| 服务休眠后连不上 | 这是正常的，等待约 30 秒自动唤醒 |

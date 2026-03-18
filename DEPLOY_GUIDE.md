# SharedBlacklist — 部署自建 Gun Relay 操作指南

## 背景

项目原先使用的公共 Gun relay (`wss://gun-manhattan.herokuapp.com/gun`) 已失效（Heroku 免费服务已停止），导致用户间数据无法同步。现已在 `relay/` 目录准备好了自建 Gun relay 服务器代码，需要你手动完成以下步骤将其部署到 Render。

---

## 你需要做的事（按顺序）

### 第一步：注册 Render 账号

1. 打开 https://render.com
2. 点击 **Get Started for Free**
3. 推荐使用 **GitHub 账号登录**（后续部署更方便）

> Render 免费方案不需要信用卡。

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

## 关于休眠

Render 免费方案的服务在 **15 分钟无请求后会自动休眠**。

- 下次有用户访问时会自动唤醒，冷启动约 **30 秒**
- 唤醒后正常运行，不影响功能
- 只要持续有用户使用，就不会休眠

这对 Gun relay 来说完全可以接受。

---

## 后续维护

| 场景 | 操作 |
|------|------|
| 更新 relay 代码 | 推送到 GitHub，Render 自动重新部署 |
| 查看运行状态 | Render Dashboard → 你的服务 → Events |
| 查看日志 | Render Dashboard → 你的服务 → Logs |
| 手动重启 | Render Dashboard → 你的服务 → Manual Deploy → Deploy latest commit |

---

## 费用说明

Render 免费方案：
- 不需要信用卡
- 750 小时/月免费运行时间（单个服务够用一整个月）
- 100GB 出站带宽/月
- 自动从 GitHub 部署

---

## 如果遇到问题

| 问题 | 解决方案 |
|------|---------|
| 部署失败 | 检查 Render Dashboard 的 Events/Logs 页面查看错误信息 |
| Root Directory 设置错误 | 确认填写的是 `relay`（不是 `relay/` 或 `./relay`） |
| 访问地址返回 502 | 查看 Logs，确认 server.js 和 package.json 文件正确 |
| 前端仍然连接失败 | 确认 `gun.js` 中地址正确，使用 `https://` 而非 `http://` |
| 服务休眠后连不上 | 这是正常的，等待约 30 秒自动唤醒 |

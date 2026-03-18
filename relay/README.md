# Gun Relay Server

SharedBlacklist 的 Gun relay 中继服务器。

## 本地运行

```bash
cd relay
npm install
npm start
# 访问 http://localhost:8765/gun
```

## 部署到 Render

详细步骤请参考项目根目录的 `DEPLOY_GUIDE.md`。

## 部署后配置

部署成功后，将 Render 分配的地址更新到 `src/constants/gun.js`：

```js
export const RELAY_PEERS = [
  'https://your-app-name.onrender.com/gun',  // 替换为实际地址
]
```

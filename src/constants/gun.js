// Gun relay 服务器地址
// 部署自建 relay 后，将下方地址替换为实际的 Render 应用地址
export const RELAY_PEERS = [
  'https://shared-blacklist-relay.onrender.com/gun', // 自建 relay（部署后替换为实际地址）
  'https://gun-manhattan.herokuapp.com/gun',          // 公共 relay 备用
]

// Gun 数据库命名空间
export const DB_NAME = 'shared-blacklist'

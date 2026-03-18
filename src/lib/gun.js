import Gun from 'gun/gun'
import 'gun/sea'
import 'gun/lib/radix'
import 'gun/lib/radisk'
import 'gun/lib/store'
import 'gun/lib/rindexed'

import { RELAY_PEERS, DB_NAME } from '../constants/gun.js'

const gun = Gun({
  peers: RELAY_PEERS,
  localStorage: false,
  radisk: true,
})

// 应用数据根节点
export const db = gun.get(DB_NAME)

// Gun 用户实例
export const user = gun.user()

export default gun

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

/**
 * 等待至少一个 relay peer 连接成功
 * @param {number} timeout - 超时毫秒数，默认 15 秒
 * @returns {Promise<void>}
 */
export function waitForRelay(timeout = 15000) {
  return new Promise((resolve, reject) => {
    // 先检查是否已连接
    const peers = gun.back('opt.peers')
    if (peers) {
      for (const url in peers) {
        const peer = peers[url]
        if (peer && peer.wire && peer.wire.readyState === 1) {
          resolve()
          return
        }
      }
    }

    const timer = setTimeout(() => {
      clearInterval(poller)
      reject(new Error('Relay 连接超时，请检查网络后重试'))
    }, timeout)

    // 轮询检查连接状态（Gun 的 'hi' 事件不总是可靠触发）
    const poller = setInterval(() => {
      const p = gun.back('opt.peers')
      if (p) {
        for (const url in p) {
          const peer = p[url]
          if (peer && peer.wire && peer.wire.readyState === 1) {
            clearTimeout(timer)
            clearInterval(poller)
            resolve()
            return
          }
        }
      }
    }, 300)
  })
}

export default gun

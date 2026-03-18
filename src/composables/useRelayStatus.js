import { ref, onUnmounted } from 'vue'
import gun from '../lib/gun.js'

/**
 * Gun relay 连接状态 composable
 */
export function useRelayStatus() {
  const connected = ref(false)
  const peerCount = ref(0)

  function checkStatus() {
    const peers = gun.back('opt.peers')
    let count = 0
    let hasConnected = false

    if (peers) {
      for (const url in peers) {
        const peer = peers[url]
        if (peer && peer.wire && peer.wire.readyState === 1) {
          count++
          hasConnected = true
        }
      }
    }

    peerCount.value = count
    connected.value = hasConnected
  }

  // 定期检查连接状态
  const timer = setInterval(checkStatus, 2000)
  checkStatus()

  onUnmounted(() => {
    clearInterval(timer)
  })

  return { connected, peerCount }
}

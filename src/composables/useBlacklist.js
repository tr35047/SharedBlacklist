import { ref, onUnmounted } from 'vue'
import { db } from '../lib/gun.js'
import { verifyApproval } from '../lib/sea.js'
import { ADMIN_PUB_KEY } from '../constants/admin.js'

/**
 * 已审核公示名单 composable
 * 订阅 Gun approved 节点，实时更新，验证签名
 */
export function useBlacklist() {
  const entries = ref([])
  const loading = ref(true)
  const entryMap = new Map()

  const approvedNode = db.get('approved')

  // 订阅所有 approved 条目
  const handler = approvedNode.map().on(async (data, id) => {
    // Gun tombstone — 已删除/拒绝的条目
    if (!data || data === null) {
      entryMap.delete(id)
      updateEntries()
      return
    }

    // 签名验证（如果公钥已配置）
    if (ADMIN_PUB_KEY !== 'REPLACE_WITH_ADMIN_PUBLIC_KEY' && data.approvalSig) {
      const payload = await verifyApproval(data.approvalSig, ADMIN_PUB_KEY)
      if (!payload || payload.entryId !== id) {
        // 签名无效，忽略该条目
        entryMap.delete(id)
        updateEntries()
        return
      }
    }

    entryMap.set(id, { ...data, id })
    updateEntries()
  })

  function updateEntries() {
    entries.value = Array.from(entryMap.values())
      .sort((a, b) => (b.approvedAt || 0) - (a.approvedAt || 0))
    loading.value = false
  }

  // 初始加载后标记为非 loading
  setTimeout(() => { loading.value = false }, 3000)

  onUnmounted(() => {
    approvedNode.map().off()
  })

  return { entries, loading }
}

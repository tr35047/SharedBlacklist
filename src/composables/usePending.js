import { ref, onUnmounted } from 'vue'
import { db } from '../lib/gun.js'

/**
 * 待审核名单 composable
 * 订阅 Gun pending 节点
 */
export function usePending() {
  const entries = ref([])
  const loading = ref(true)
  const entryMap = new Map()

  const pendingNode = db.get('pending')

  pendingNode.map().on((data, id) => {
    if (!data || data === null) {
      entryMap.delete(id)
      updateEntries()
      return
    }
    entryMap.set(id, { ...data, id })
    updateEntries()
  })

  function updateEntries() {
    entries.value = Array.from(entryMap.values())
      .sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0))
    loading.value = false
  }

  setTimeout(() => { loading.value = false }, 3000)

  onUnmounted(() => {
    pendingNode.map().off()
  })

  return { entries, loading }
}

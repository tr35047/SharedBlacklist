import { ref, computed } from 'vue'
import gun, { db, user } from '../lib/gun.js'
import { authenticateAdmin, authenticateWithPair, exportAdminPair, signApproval } from '../lib/sea.js'
import { ADMIN_ALIAS, ADMIN_PUB_KEY } from '../constants/admin.js'
import { generateId } from '../lib/id-generator.js'

/**
 * 管理员认证 + 审核操作 composable
 */
export function useAdmin() {
  const pair = ref(null)
  const isAdmin = computed(() => !!pair.value)
  const loginError = ref('')
  const loggingIn = ref(false)

  async function login(password) {
    loginError.value = ''
    loggingIn.value = true

    try {
      const result = await authenticateAdmin(user, ADMIN_ALIAS, password)
      pair.value = result
      // 登录成功后自动保存密钥对，防止后续 alias 冲突
      try { exportAdminPair(result) } catch {}
    } catch (e) {
      loginError.value = e.message
    } finally {
      loggingIn.value = false
    }
  }

  /**
   * 使用完整密钥对 JSON 直接登录（绕过 alias 冲突）
   */
  async function loginWithPair(pairJson) {
    loginError.value = ''
    loggingIn.value = true

    try {
      const pairData = typeof pairJson === 'string' ? JSON.parse(pairJson) : pairJson
      const result = await authenticateWithPair(user, pairData)
      pair.value = result
      try { exportAdminPair(result) } catch {}
    } catch (e) {
      loginError.value = e.message
    } finally {
      loggingIn.value = false
    }
  }

  function logout() {
    user.leave()
    pair.value = null
  }

  /**
   * 审核通过 — 签名 + 写入 approved + 删除 pending
   */
  async function approve(entry) {
    if (!pair.value) throw new Error('未登录')

    const nonce = generateId()
    const payload = {
      action: 'approve',
      entryId: entry.id,
      timestamp: Date.now(),
      nonce,
    }

    const sig = await signApproval(pair.value, payload)

    const approved = {
      id: entry.id,
      name: entry.name,
      behavior: entry.behavior,
      severity: entry.severity,
      remark: entry.remark || '',
      screenshot: entry.screenshot || '',
      submittedAt: entry.submittedAt,
      deviceInfo: entry.deviceInfo || '',
      approvedAt: Date.now(),
      approvalSig: sig,
      approvalPayload: JSON.stringify(payload),
    }

    // 写入 approved
    await new Promise((resolve, reject) => {
      db.get('approved').get(entry.id).put(approved, (ack) => {
        if (ack.err) reject(new Error(ack.err))
        else resolve()
      })
    })

    // 删除 pending（置 null）
    await new Promise((resolve, reject) => {
      db.get('pending').get(entry.id).put(null, (ack) => {
        if (ack.err) reject(new Error(ack.err))
        else resolve()
      })
    })
  }

  /**
   * 拒绝 — 仅删除 pending
   */
  async function reject(entry) {
    if (!pair.value) throw new Error('未登录')

    await new Promise((resolve, rej) => {
      db.get('pending').get(entry.id).put(null, (ack) => {
        if (ack.err) rej(new Error(ack.err))
        else resolve()
      })
    })
  }

  /**
   * 从公示列表移除
   */
  async function remove(entry) {
    if (!pair.value) throw new Error('未登录')

    await new Promise((resolve, rej) => {
      db.get('approved').get(entry.id).put(null, (ack) => {
        if (ack.err) rej(new Error(ack.err))
        else resolve()
      })
    })
  }

  return {
    pair,
    isAdmin,
    loginError,
    loggingIn,
    login,
    loginWithPair,
    logout,
    approve,
    reject,
    remove,
  }
}

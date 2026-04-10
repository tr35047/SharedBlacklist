import SEA from 'gun/sea'
import { ADMIN_PUB_KEY } from '../constants/admin.js'

/**
 * 使用 Gun 用户系统认证管理员
 * 先尝试 alias+password 登录，若公钥不匹配则自动尝试用密钥对直接认证
 * @param {object} user - gun.user() 实例
 * @param {string} alias - 管理员别名
 * @param {string} password - 管理员密码
 * @returns {Promise<object>} 密钥对 { pub, priv, epub, epriv }
 */
export async function authenticateAdmin(user, alias, password) {
  // 先尝试常规 alias+password 认证
  const pair = await new Promise((resolve, reject) => {
    user.auth(alias, password, (ack) => {
      if (ack.err) {
        reject(new Error(ack.err))
        return
      }
      resolve(user._.sea)
    })
  })

  if (pair.pub === ADMIN_PUB_KEY) {
    return pair
  }

  // 公钥不匹配 — alias 冲突，尝试用密码派生正确的密钥对
  user.leave()
  const recoveredPair = await recoverAdminPair(user, password)
  if (recoveredPair) {
    return recoveredPair
  }

  throw new Error('公钥不匹配，非管理员账户。可能存在同名 alias 冲突。')
}

/**
 * 尝试通过保存的密钥对恢复管理员会话
 * 从 localStorage 读取之前导出的完整密钥对
 */
async function recoverAdminPair(user, password) {
  const saved = localStorage.getItem('admin_pair')
  if (!saved) return null

  try {
    const pair = JSON.parse(saved)
    if (pair.pub !== ADMIN_PUB_KEY) return null

    return await new Promise((resolve, reject) => {
      user.auth(pair, (ack) => {
        if (ack.err) {
          reject(new Error(ack.err))
          return
        }
        resolve(pair)
      })
    })
  } catch {
    return null
  }
}

/**
 * 导出当前管理员密钥对到 localStorage（在能正常登录的环境执行一次）
 */
export function exportAdminPair(pair) {
  if (pair.pub !== ADMIN_PUB_KEY) {
    throw new Error('公钥不匹配，无法导出')
  }
  localStorage.setItem('admin_pair', JSON.stringify(pair))
}

/**
 * 使用完整密钥对直接认证（绕过 alias 查找）
 */
export async function authenticateWithPair(user, pair) {
  if (pair.pub !== ADMIN_PUB_KEY) {
    throw new Error('公钥不匹配，非管理员密钥对')
  }
  return new Promise((resolve, reject) => {
    user.auth(pair, (ack) => {
      if (ack.err) {
        reject(new Error(ack.err))
        return
      }
      resolve(pair)
    })
  })
}

/**
 * 创建管理员账户（仅首次部署使用）
 */
export async function createAdminAccount(user, alias, password) {
  return new Promise((resolve, reject) => {
    user.create(alias, password, (ack) => {
      if (ack.err) {
        reject(new Error(ack.err))
        return
      }
      // 创建后需要 auth 获取密钥对
      user.auth(alias, password, (authAck) => {
        if (authAck.err) {
          reject(new Error(authAck.err))
          return
        }
        resolve(user._.sea)
      })
    })
  })
}

/**
 * 对审核操作进行签名
 * @param {object} pair - 管理员密钥对
 * @param {object} payload - { action, entryId, timestamp, nonce }
 * @returns {Promise<string>} 签名字符串
 */
export async function signApproval(pair, payload) {
  const message = JSON.stringify(payload)
  const sig = await SEA.sign(message, pair)
  return sig
}

/**
 * 验证审核签名
 * @param {string} sig - 签名字符串
 * @param {string} pubKey - 管理员公钥
 * @returns {Promise<object|false>} 验证通过返回原始 payload，否则 false
 */
export async function verifyApproval(sig, pubKey) {
  const result = await SEA.verify(sig, pubKey)
  if (!result) return false
  // SEA.verify 对有效 JSON 字符串签名会返回已解析的对象
  if (typeof result === 'object') return result
  try {
    return JSON.parse(result)
  } catch {
    return false
  }
}

export { SEA }

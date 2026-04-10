import SEA from 'gun/sea'
import { ADMIN_PUB_KEY } from '../constants/admin.js'
import { waitForRelay } from './gun.js'

/**
 * 使用 Gun 用户系统认证管理员
 * @param {object} user - gun.user() 实例
 * @param {string} alias - 管理员别名
 * @param {string} password - 管理员密码
 * @returns {Promise<object>} 密钥对 { pub, priv, epub, epriv }
 */
export async function authenticateAdmin(user, alias, password) {
  // 等待 relay 连接，确保能同步到用户数据（正确的 salt）
  await waitForRelay()

  return new Promise((resolve, reject) => {
    user.auth(alias, password, (ack) => {
      if (ack.err) {
        reject(new Error(ack.err))
        return
      }
      const pair = user._.sea
      if (pair.pub !== ADMIN_PUB_KEY) {
        user.leave()
        reject(new Error('公钥不匹配，非管理员账户'))
        return
      }
      resolve(pair)
    })
  })
}

/**
 * 创建管理员账户
 * 如果同名 alias 已被占用且密码不同，自动追加后缀（-2, -3, ...）直到创建成功
 * @returns {Promise<{pair: object, alias: string}>} 密钥对 + 实际使用的 alias
 */
export async function createAdminAccount(user, baseAlias, password, maxRetries = 20) {
  let alias = baseAlias

  for (let i = 1; i <= maxRetries; i++) {
    // 尝试创建
    const created = await new Promise((resolve) => {
      user.create(alias, password, (ack) => {
        resolve(!ack.err)
      })
    })

    if (created) {
      // 创建成功 → 登录获取密钥对
      const pair = await new Promise((resolve, reject) => {
        user.auth(alias, password, (ack) => {
          if (ack.err) reject(new Error(ack.err))
          else resolve(user._.sea)
        })
      })
      return { pair, alias }
    }

    // alias 已存在 → 尝试用当前密码登录删除
    const loggedIn = await new Promise((resolve) => {
      user.auth(alias, password, (ack) => {
        resolve(!ack.err)
      })
    })

    if (loggedIn) {
      // 密码匹配 → 删除旧账户再重建
      await new Promise((resolve, reject) => {
        user.delete(alias, password, (ack) => {
          if (ack.ok === 0 || ack.err) reject(new Error('删除旧账户失败：' + (ack.err || '未知错误')))
          else resolve()
        })
      })
      // 重新创建
      await new Promise((resolve, reject) => {
        user.create(alias, password, (ack) => {
          if (ack.err) reject(new Error('重新创建失败：' + ack.err))
          else resolve()
        })
      })
      const pair = await new Promise((resolve, reject) => {
        user.auth(alias, password, (ack) => {
          if (ack.err) reject(new Error(ack.err))
          else resolve(user._.sea)
        })
      })
      return { pair, alias }
    }

    // 密码不匹配 → 换下一个后缀
    alias = `${baseAlias}-${i + 1}`
  }

  throw new Error(`尝试了 ${maxRetries} 个别名均已被占用，请手动指定别名`)
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

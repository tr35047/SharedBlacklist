import { RELAY_PEERS } from '../constants/gun.js'

const RELAY_BASE = RELAY_PEERS[0].replace(/\/gun\/?$/, '')

/**
 * 采集提交者设备信息（静默采集，不需要用户操作）
 */

/**
 * 解析 User-Agent 为可读的设备/浏览器描述
 */
function parseUserAgent(ua) {
  if (!ua) return '未知'

  let browser = '未知浏览器'
  let os = '未知系统'

  // 浏览器识别
  if (ua.includes('Edg/')) {
    browser = 'Edge ' + (ua.match(/Edg\/([\d.]+)/)?.[1] || '')
  } else if (ua.includes('Chrome/') && !ua.includes('Edg/')) {
    browser = 'Chrome ' + (ua.match(/Chrome\/([\d.]+)/)?.[1] || '')
  } else if (ua.includes('Firefox/')) {
    browser = 'Firefox ' + (ua.match(/Firefox\/([\d.]+)/)?.[1] || '')
  } else if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
    browser = 'Safari ' + (ua.match(/Version\/([\d.]+)/)?.[1] || '')
  }

  // 操作系统识别
  if (ua.includes('Windows NT 10.0')) {
    os = 'Windows 10/11'
  } else if (ua.includes('Windows NT 6.1')) {
    os = 'Windows 7'
  } else if (ua.includes('Mac OS X')) {
    os = 'macOS ' + (ua.match(/Mac OS X ([\d_]+)/)?.[1]?.replace(/_/g, '.') || '')
  } else if (ua.includes('Android')) {
    const model = ua.match(/;\s*([^;)]+)\s*Build/)?.[1]?.trim() || ''
    os = 'Android ' + (ua.match(/Android ([\d.]+)/)?.[1] || '') + (model ? ' (' + model + ')' : '')
  } else if (ua.includes('iPhone')) {
    os = 'iPhone (iOS ' + (ua.match(/iPhone OS ([\d_]+)/)?.[1]?.replace(/_/g, '.') || '') + ')'
  } else if (ua.includes('iPad')) {
    os = 'iPad (iOS ' + (ua.match(/CPU OS ([\d_]+)/)?.[1]?.replace(/_/g, '.') || '') + ')'
  } else if (ua.includes('Linux')) {
    os = 'Linux'
  }

  return `${browser} / ${os}`
}

/**
 * 采集用户设备信息
 * @returns {Promise<object>} 设备信息对象
 */
export async function collectDeviceInfo() {
  const info = {
    ip: '获取失败',
    location: '获取失败',
    coordinates: '获取失败',
    device: parseUserAgent(navigator.userAgent),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '未知',
  }

  try {
    const resp = await fetch(`${RELAY_BASE}/api/ipinfo`, {
      signal: AbortSignal.timeout(5000),
    })
    if (resp.ok) {
      const data = await resp.json()
      if (data.query) info.ip = data.query
      const parts = [data.country, data.regionName, data.city].filter(Boolean)
      if (parts.length > 0) info.location = parts.join(' ')
      if (data.lat != null && data.lon != null) info.coordinates = `${data.lat}, ${data.lon}`
    }
  } catch {
    // IP 获取失败不阻塞提交
  }

  return info
}

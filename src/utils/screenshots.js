/**
 * 解析截图字段，兼容旧版单 URL 和新版 JSON 数组格式
 * @param {string} value - screenshot 字段值
 * @returns {string[]} 截图 URL 数组
 */
export function parseScreenshots(value) {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    if (Array.isArray(parsed)) return parsed.filter(Boolean)
  } catch {
    // 旧格式：单个 URL 字符串
  }
  return [value]
}

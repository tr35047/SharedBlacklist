/**
 * 生成防碰撞 ID
 * 时间戳 + 4位随机hex，如 "1710672000000-a3f2"
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`
}

/**
 * 严重程度 [1, 5] → 背景色
 * HSL lightness 从 90%（轻微）到 40%（严重）
 */
export function severityToBackground(severity) {
  const s = Math.max(1, Math.min(5, severity))
  const lightness = 90 - ((s - 1) / 4) * 50
  return `hsl(0, 75%, ${lightness}%)`
}

/**
 * 严重程度 → 文字颜色
 * severity >= 3.5 用白色，否则深红色
 */
export function severityToTextColor(severity) {
  return severity >= 3.5 ? '#ffffff' : '#7c1d1d'
}

/**
 * 严重程度标签
 */
export function severityLabel(severity) {
  const labels = ['轻微', '一般', '中等', '严重', '极其严重']
  const idx = Math.max(0, Math.min(4, Math.round(severity) - 1))
  return labels[idx]
}

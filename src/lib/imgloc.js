import { RELAY_PEERS } from '../constants/gun.js'

// 从 relay peer URL 中提取基础地址（去掉 /gun 后缀）
const RELAY_BASE = RELAY_PEERS[0].replace(/\/gun\/?$/, '')
const UPLOAD_URL = `${RELAY_BASE}/api/upload`

/**
 * 上传图片到 ImgLoc 图床（通过 relay 代理，绕过 CORS）
 * @param {File} file - 图片文件
 * @returns {Promise<string>} 图片 URL
 */
export async function uploadImage(file) {
  const formData = new FormData()
  formData.append('source', file)

  const res = await fetch(UPLOAD_URL, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    throw new Error(`上传失败 (${res.status})`)
  }

  const data = await res.json()

  if (data.status_code !== 200) {
    throw new Error(data.error?.message || '上传失败')
  }

  return data.image.url
}

import { ref } from 'vue'
import { db } from '../lib/gun.js'
import { generateId } from '../lib/id-generator.js'
import { validateSubmission } from '../utils/validators.js'
import { uploadImage } from '../lib/imgloc.js'

/**
 * 访客提交举报 composable
 */
export function useSubmission() {
  const submitting = ref(false)
  const error = ref('')
  const success = ref(false)
  const uploadProgress = ref('')

  async function submit({ name, behavior, severity, remark, screenshots }) {
    error.value = ''
    success.value = false
    uploadProgress.value = ''

    const { valid, errors } = validateSubmission({ name, behavior, severity, remark, screenshots })
    if (!valid) {
      error.value = errors.join('；')
      return false
    }

    submitting.value = true

    try {
      const screenshotUrls = []
      if (screenshots && screenshots.length > 0) {
        for (let i = 0; i < screenshots.length; i++) {
          uploadProgress.value = `正在上传截图 (${i + 1}/${screenshots.length})...`
          const url = await uploadImage(screenshots[i])
          screenshotUrls.push(url)
        }
      }

      uploadProgress.value = '正在提交...'
      const id = generateId()
      const entry = {
        id,
        name: name.trim(),
        behavior: behavior.trim(),
        severity: Number(severity),
        remark: (remark || '').trim(),
        screenshot: JSON.stringify(screenshotUrls),
        submittedAt: Date.now(),
      }

      await new Promise((resolve, reject) => {
        db.get('pending').get(id).put(entry, (ack) => {
          if (ack.err) reject(new Error(ack.err))
          else resolve()
        })
      })

      success.value = true
      return true
    } catch (e) {
      error.value = '提交失败：' + e.message
      return false
    } finally {
      submitting.value = false
      uploadProgress.value = ''
    }
  }

  function reset() {
    error.value = ''
    success.value = false
    uploadProgress.value = ''
  }

  return { submit, submitting, error, success, uploadProgress, reset }
}

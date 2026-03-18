/**
 * 校验黑名单提交表单
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateSubmission({ name, behavior, severity, remark }) {
  const errors = []

  if (!name || !name.trim()) {
    errors.push('姓名不能为空')
  } else if (name.trim().length > 50) {
    errors.push('姓名不超过 50 个字符')
  }

  if (!behavior || !behavior.trim()) {
    errors.push('行为描述不能为空')
  } else if (behavior.trim().length > 200) {
    errors.push('行为描述不超过 200 个字符')
  }

  if (!severity || severity < 1 || severity > 5) {
    errors.push('请选择严重程度（1-5）')
  }

  if (remark && remark.trim().length > 500) {
    errors.push('备注不超过 500 个字符')
  }

  return { valid: errors.length === 0, errors }
}

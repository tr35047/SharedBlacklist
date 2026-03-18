<template>
  <BaseModal v-model="show" title="提交举报" maxWidth="520px">
    <form @submit.prevent="handleSubmit" class="submit-form">
      <div class="form-group">
        <label>姓名 <span class="required">*</span></label>
        <input
          v-model="form.name"
          type="text"
          placeholder="被举报人姓名"
          maxlength="50"
        />
      </div>

      <div class="form-group">
        <label>行为描述 <span class="required">*</span></label>
        <textarea
          v-model="form.behavior"
          placeholder="简要描述不良行为"
          rows="3"
          maxlength="200"
        ></textarea>
        <span class="char-count">{{ (form.behavior || '').length }}/200</span>
      </div>

      <div class="form-group">
        <label>严重程度 <span class="required">*</span></label>
        <StarRating v-model="form.severity" />
      </div>

      <div class="form-group">
        <label>备注（可选）</label>
        <textarea
          v-model="form.remark"
          placeholder="补充说明、证据链接等"
          rows="3"
          maxlength="500"
        ></textarea>
        <span class="char-count">{{ (form.remark || '').length }}/500</span>
      </div>

      <div v-if="error" class="form-error">{{ error }}</div>

      <div v-if="success" class="form-success">
        提交成功！等待管理员审核。
      </div>

      <div class="form-actions">
        <button type="button" class="btn-cancel" @click="show = false">取消</button>
        <button type="submit" class="btn-submit" :disabled="submitting">
          {{ submitting ? '提交中...' : '提交' }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { reactive, computed } from 'vue'
import BaseModal from './BaseModal.vue'
import StarRating from './StarRating.vue'
import { useSubmission } from '../composables/useSubmission.js'

const props = defineProps({
  modelValue: Boolean,
})
const emit = defineEmits(['update:modelValue'])

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const { submit, submitting, error, success, reset } = useSubmission()

const form = reactive({
  name: '',
  behavior: '',
  severity: 0,
  remark: '',
})

async function handleSubmit() {
  const ok = await submit({ ...form })
  if (ok) {
    setTimeout(() => {
      show.value = false
      resetForm()
    }, 1500)
  }
}

function resetForm() {
  form.name = ''
  form.behavior = ''
  form.severity = 0
  form.remark = ''
  reset()
}
</script>

<style scoped>
.submit-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.required {
  color: var(--color-accent);
}

.form-group input,
.form-group textarea {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  color: var(--color-text);
  outline: none;
  transition: border-color var(--transition);
  resize: vertical;
}
.form-group input:focus,
.form-group textarea:focus {
  border-color: var(--color-accent);
}

.char-count {
  position: absolute;
  bottom: 8px;
  right: 10px;
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  pointer-events: none;
}

.form-error {
  background: rgba(229, 62, 62, 0.1);
  border: 1px solid var(--color-danger);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  color: var(--color-danger);
  font-size: 0.85rem;
}

.form-success {
  background: rgba(56, 161, 105, 0.1);
  border: 1px solid var(--color-success);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  color: var(--color-success);
  font-size: 0.85rem;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-cancel {
  background: var(--color-surface-hover);
  color: var(--color-text);
  padding: 10px 20px;
  border-radius: var(--radius-sm);
  transition: background var(--transition);
}
.btn-cancel:hover {
  background: var(--color-border);
}

.btn-submit {
  background: var(--color-accent);
  color: #fff;
  padding: 10px 24px;
  border-radius: var(--radius-sm);
  font-weight: 500;
  transition: background var(--transition);
}
.btn-submit:hover:not(:disabled) {
  background: var(--color-accent-hover);
}
.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

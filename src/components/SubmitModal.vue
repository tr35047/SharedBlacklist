<template>
  <BaseModal v-model="show" title="提交举报" maxWidth="520px">
    <form @submit.prevent="handleSubmit" class="submit-form">
      <div class="form-group">
        <label>游戏ID <span class="required">*</span></label>
        <input
          v-model="form.name"
          type="text"
          placeholder="游戏ID"
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
        <label>截图（可选）</label>
        <div class="upload-area" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleDrop">
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="file-input-hidden"
            @change="handleFileChange"
          />
          <div v-if="!previewUrl" class="upload-placeholder">
            <span class="upload-icon">+</span>
            <span class="upload-text">点击或拖拽上传截图</span>
            <span class="upload-hint">支持 JPG / PNG / GIF，最大 5MB</span>
          </div>
          <div v-else class="upload-preview">
            <img :src="previewUrl" alt="截图预览" />
            <button type="button" class="btn-remove-img" @click.stop="removeFile">移除</button>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>备注（可选）</label>
        <textarea
          v-model="form.remark"
          placeholder="补充说明"
          rows="3"
          maxlength="500"
        ></textarea>
        <span class="char-count">{{ (form.remark || '').length }}/500</span>
      </div>

      <div v-if="error" class="form-error">{{ error }}</div>

      <div v-if="uploadProgress" class="form-progress">{{ uploadProgress }}</div>

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
import { reactive, computed, ref } from 'vue'
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

const { submit, submitting, error, success, uploadProgress, reset } = useSubmission()

const form = reactive({
  name: '',
  behavior: '',
  severity: 0,
  remark: '',
})

const fileInput = ref(null)
const screenshotFile = ref(null)
const previewUrl = ref('')

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileChange(e) {
  const file = e.target.files?.[0]
  if (file) setFile(file)
}

function handleDrop(e) {
  const file = e.dataTransfer.files?.[0]
  if (file && file.type.startsWith('image/')) setFile(file)
}

function setFile(file) {
  if (file.size > MAX_FILE_SIZE) {
    error.value = '图片大小不能超过 5MB'
    return
  }
  if (!file.type.startsWith('image/')) {
    error.value = '请选择图片文件'
    return
  }
  screenshotFile.value = file
  previewUrl.value = URL.createObjectURL(file)
}

function removeFile() {
  screenshotFile.value = null
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = ''
  }
  if (fileInput.value) fileInput.value.value = ''
}

async function handleSubmit() {
  const ok = await submit({ ...form, screenshot: screenshotFile.value })
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
  removeFile()
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

.upload-area {
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: border-color var(--transition);
  overflow: hidden;
}
.upload-area:hover {
  border-color: var(--color-accent);
}

.file-input-hidden {
  display: none;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 24px;
  color: var(--color-text-secondary);
}

.upload-icon {
  font-size: 1.8rem;
  line-height: 1;
  opacity: 0.5;
}

.upload-text {
  font-size: 0.85rem;
}

.upload-hint {
  font-size: 0.75rem;
  opacity: 0.6;
}

.upload-preview {
  position: relative;
  display: flex;
  justify-content: center;
  padding: 8px;
}

.upload-preview img {
  max-width: 100%;
  max-height: 200px;
  border-radius: var(--radius-sm);
  object-fit: contain;
}

.btn-remove-img {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  padding: 4px 10px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-remove-img:hover {
  background: rgba(229, 62, 62, 0.8);
}

.form-error {
  background: rgba(229, 62, 62, 0.1);
  border: 1px solid var(--color-danger);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  color: var(--color-danger);
  font-size: 0.85rem;
}

.form-progress {
  text-align: center;
  padding: 8px;
  color: var(--color-accent);
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

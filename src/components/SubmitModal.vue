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
        <label>截图 <span class="required">*</span>（注意：必须上传图片作为审核依据，如果上传与举报内容无关的图片，审核不予通过）<span class="upload-count">上传限制：{{ screenshotFiles.length }}/2</span></label>
        <div class="upload-area" @click="triggerFileInput" @dragover.prevent @drop.prevent="handleDrop">
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            multiple
            class="file-input-hidden"
            @change="handleFileChange"
          />
          <div v-if="screenshotFiles.length === 0" class="upload-placeholder">
            <span class="upload-icon">+</span>
            <span class="upload-text">点击或拖拽上传截图</span>
            <span class="upload-hint">支持 JPG / PNG / GIF，最大 8MB / 张，最多 2 张</span>
          </div>
        </div>
        <div v-if="previewUrls.length > 0" class="upload-previews">
          <div v-for="(url, index) in previewUrls" :key="index" class="upload-preview-item">
            <img :src="url" alt="截图预览" />
            <button type="button" class="btn-remove-img" @click="removeFile(index)">×</button>
          </div>
          <div v-if="screenshotFiles.length < 2" class="upload-add-more" @click="triggerFileInput">
            <span class="upload-icon">+</span>
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
const screenshotFiles = ref([])
const previewUrls = ref([])

const MAX_FILE_SIZE = 8 * 1024 * 1024 // 8MB
const MAX_FILES = 2

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileChange(e) {
  const files = Array.from(e.target.files || [])
  files.forEach(addFile)
  if (fileInput.value) fileInput.value.value = ''
}

function handleDrop(e) {
  const files = Array.from(e.dataTransfer.files || [])
  files.filter(f => f.type.startsWith('image/')).forEach(addFile)
}

function addFile(file) {
  if (screenshotFiles.value.length >= MAX_FILES) {
    error.value = `最多上传 ${MAX_FILES} 张截图`
    return
  }
  if (file.size > MAX_FILE_SIZE) {
    error.value = '图片大小不能超过 8MB'
    return
  }
  if (!file.type.startsWith('image/')) {
    error.value = '请选择图片文件'
    return
  }
  screenshotFiles.value.push(file)
  previewUrls.value.push(URL.createObjectURL(file))
}

function removeFile(index) {
  screenshotFiles.value.splice(index, 1)
  URL.revokeObjectURL(previewUrls.value[index])
  previewUrls.value.splice(index, 1)
}

function clearFiles() {
  previewUrls.value.forEach(url => URL.revokeObjectURL(url))
  screenshotFiles.value = []
  previewUrls.value = []
  if (fileInput.value) fileInput.value.value = ''
}

async function handleSubmit() {
  const ok = await submit({ ...form, screenshots: screenshotFiles.value })
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
  clearFiles()
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

.upload-count {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  font-weight: 400;
}

.upload-previews {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.upload-preview-item {
  position: relative;
  width: 90px;
  height: 90px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--color-border);
}

.upload-preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-remove-img {
  position: absolute;
  top: 2px;
  right: 2px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 0.75rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.btn-remove-img:hover {
  background: rgba(229, 62, 62, 0.8);
}

.upload-add-more {
  width: 90px;
  height: 90px;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: border-color var(--transition);
}
.upload-add-more:hover {
  border-color: var(--color-accent);
}
.upload-add-more .upload-icon {
  font-size: 1.5rem;
  opacity: 0.5;
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

@media (max-width: 480px) {
  .form-actions {
    flex-direction: column;
  }

  .btn-cancel,
  .btn-submit {
    width: 100%;
    text-align: center;
  }
}
</style>

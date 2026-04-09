<template>
  <div class="review-card">
    <div class="review-header">
      <h4><span class="field-label">游戏ID:</span> {{ entry.name }}</h4>
      <StarRating :modelValue="entry.severity" readonly showLabel />
    </div>
    <p class="review-behavior"><span class="field-label">行为描述:</span> {{ entry.behavior }}</p>
    <p v-if="entry.remark" class="review-remark"><span class="field-label">备注:</span> {{ entry.remark }}</p>
    <div v-if="screenshots.length > 0" class="review-screenshots">
      <a v-for="(url, i) in screenshots" :key="i" :href="url" target="_blank" rel="noopener">
        <img :src="url" alt="举报截图" />
      </a>
    </div>
    <div v-if="deviceInfo" class="device-info-section">
      <button type="button" class="device-info-toggle" @click="showDeviceInfo = !showDeviceInfo">
        <span class="toggle-arrow" :class="{ open: showDeviceInfo }">&#9656;</span>
        提交者信息
      </button>
      <div v-if="showDeviceInfo" class="device-info-detail">
        <div class="device-info-row"><span class="device-label">IP:</span> {{ deviceInfo.ip }}</div>
        <div class="device-info-row"><span class="device-label">位置:</span> {{ deviceInfo.location }}</div>
        <div class="device-info-row"><span class="device-label">设备:</span> {{ deviceInfo.device }}</div>
        <div class="device-info-row"><span class="device-label">坐标:</span> {{ deviceInfo.coordinates }}</div>
        <div class="device-info-row"><span class="device-label">时区:</span> {{ deviceInfo.timezone }}</div>
      </div>
    </div>
    <div class="review-meta">
      <span>{{ formatDate(entry.submittedAt) }}</span>
    </div>
    <div class="review-actions">
      <button class="btn-reject" @click="$emit('reject', entry)" :disabled="processing">
        拒绝
      </button>
      <button class="btn-approve" @click="$emit('approve', entry)" :disabled="processing">
        {{ processing ? '处理中...' : '通过' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import StarRating from './StarRating.vue'
import { parseScreenshots } from '../utils/screenshots.js'

const props = defineProps({
  entry: { type: Object, required: true },
  processing: { type: Boolean, default: false },
})

defineEmits(['approve', 'reject'])

const screenshots = computed(() => parseScreenshots(props.entry.screenshot))
const showDeviceInfo = ref(false)

const deviceInfo = computed(() => {
  if (!props.entry.deviceInfo) return null
  try {
    return JSON.parse(props.entry.deviceInfo)
  } catch {
    return null
  }
})

function formatDate(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleString('zh-CN')
}
</script>

<style scoped>
.review-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 16px;
}

.review-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.review-header h4 {
  font-size: 1rem;
}

.field-label {
  color: var(--color-text-secondary);
  font-weight: 400;
  font-size: 0.85rem;
}

.review-behavior {
  font-size: 0.9rem;
  color: var(--color-text);
  margin-bottom: 8px;
}

.review-remark {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  background: var(--color-bg);
  border-radius: var(--radius-sm);
  padding: 10px;
  margin-bottom: 8px;
  white-space: pre-wrap;
}

.review-meta {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
}

.review-screenshots {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}
.review-screenshots img {
  max-width: 120px;
  max-height: 120px;
  border-radius: var(--radius-sm);
  object-fit: cover;
}

.device-info-section {
  margin-bottom: 8px;
}

.device-info-toggle {
  background: none;
  border: none;
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  padding: 2px 0;
  display: flex;
  align-items: center;
  gap: 4px;
}
.device-info-toggle:hover {
  color: var(--color-text);
}

.toggle-arrow {
  display: inline-block;
  transition: transform 0.2s;
  font-size: 0.7rem;
}
.toggle-arrow.open {
  transform: rotate(90deg);
}

.device-info-detail {
  background: var(--color-bg);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  margin-top: 6px;
  font-size: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.device-info-row {
  color: var(--color-text);
}

.device-label {
  color: var(--color-text-secondary);
  margin-right: 4px;
}

.review-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-reject {
  background: var(--color-surface-hover);
  color: var(--color-text);
  padding: 8px 18px;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  transition: background var(--transition);
}
.btn-reject:hover:not(:disabled) {
  background: var(--color-border);
}

.btn-approve {
  background: var(--color-success);
  color: #fff;
  padding: 8px 18px;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 500;
  transition: background var(--transition);
}
.btn-approve:hover:not(:disabled) {
  background: #2f855a;
}

.btn-reject:disabled,
.btn-approve:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .review-header {
    flex-wrap: wrap;
    gap: 6px;
  }

  .review-actions {
    flex-direction: column;
  }

  .btn-reject,
  .btn-approve {
    width: 100%;
    text-align: center;
    padding: 10px 18px;
  }
}
</style>

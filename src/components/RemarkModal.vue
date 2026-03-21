<template>
  <BaseModal :modelValue="!!entry" @update:modelValue="$emit('close')" title="详细信息">
    <div v-if="entry" class="remark-detail">
      <div class="detail-row">
        <label>姓名</label>
        <span>{{ entry.name }}</span>
      </div>
      <div class="detail-row">
        <label>行为</label>
        <span>{{ entry.behavior }}</span>
      </div>
      <div class="detail-row">
        <label>严重程度</label>
        <StarRating :modelValue="entry.severity" readonly showLabel />
      </div>
      <div class="detail-row" v-if="entry.screenshot">
        <label>截图</label>
        <a :href="entry.screenshot" target="_blank" rel="noopener">
          <img :src="entry.screenshot" alt="举报截图" class="screenshot-img" />
        </a>
      </div>
      <div class="detail-row" v-if="entry.remark">
        <label>备注</label>
        <p class="remark-text">{{ entry.remark }}</p>
      </div>
      <div class="detail-row">
        <label>提交时间</label>
        <span>{{ formatDate(entry.submittedAt) }}</span>
      </div>
      <div class="detail-row" v-if="entry.approvedAt">
        <label>审核时间</label>
        <span>{{ formatDate(entry.approvedAt) }}</span>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import BaseModal from './BaseModal.vue'
import StarRating from './StarRating.vue'

defineProps({
  entry: { type: Object, default: null },
})

defineEmits(['close'])

function formatDate(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleString('zh-CN')
}
</script>

<style scoped>
.remark-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-row label {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.remark-text {
  background: var(--color-bg);
  border-radius: var(--radius-sm);
  padding: 12px;
  line-height: 1.6;
  white-space: pre-wrap;
}

.screenshot-img {
  max-width: 100%;
  max-height: 300px;
  border-radius: var(--radius-sm);
  object-fit: contain;
  cursor: pointer;
  transition: opacity 0.2s;
}
.screenshot-img:hover {
  opacity: 0.85;
}
</style>

<template>
  <BaseModal :modelValue="!!group" @update:modelValue="$emit('close')" title="详细信息">
    <div v-if="group" class="remark-detail">
      <div class="group-summary">
        <h3 class="group-name">
          {{ group.name }}
          <span v-if="group.count > 1" class="group-count">x{{ group.count }}次</span>
        </h3>
        <p class="group-hint">以下为该名称下全部公示记录</p>
      </div>

      <div
        v-for="record in group.records"
        :key="record.id"
        class="detail-card"
      >
        <div class="detail-row">
          <label>名称</label>
          <span>{{ record.name }}</span>
        </div>
        <div class="detail-row">
          <label>行为</label>
          <span>{{ record.behavior }}</span>
        </div>
        <div class="detail-row">
          <label>严重程度</label>
          <StarRating :modelValue="record.severity" readonly showLabel />
        </div>
        <div class="detail-row" v-if="record.screenshot">
          <label>截图</label>
          <a :href="record.screenshot" target="_blank" rel="noopener">
            <img :src="record.screenshot" alt="举报截图" class="screenshot-img" />
          </a>
        </div>
        <div class="detail-row" v-if="record.remark">
          <label>备注</label>
          <p class="remark-text">{{ record.remark }}</p>
        </div>
        <div class="detail-row">
          <label>提交时间</label>
          <span>{{ formatDate(record.submittedAt) }}</span>
        </div>
        <div class="detail-row" v-if="record.approvedAt">
          <label>审核时间</label>
          <span>{{ formatDate(record.approvedAt) }}</span>
        </div>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import BaseModal from './BaseModal.vue'
import StarRating from './StarRating.vue'

defineProps({
  group: { type: Object, default: null },
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

.group-summary {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.group-name {
  font-size: 1.15rem;
  font-weight: 600;
}

.group-count {
  margin-left: 6px;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.group-hint {
  color: var(--color-text-secondary);
  font-size: 0.85rem;
}

.detail-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 16px;
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

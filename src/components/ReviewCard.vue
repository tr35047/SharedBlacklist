<template>
  <div class="review-card">
    <div class="review-header">
      <h4>{{ entry.name }}</h4>
      <StarRating :modelValue="entry.severity" readonly showLabel />
    </div>
    <p class="review-behavior">{{ entry.behavior }}</p>
    <p v-if="entry.remark" class="review-remark">{{ entry.remark }}</p>
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
import StarRating from './StarRating.vue'

defineProps({
  entry: { type: Object, required: true },
  processing: { type: Boolean, default: false },
})

defineEmits(['approve', 'reject'])

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
</style>

<template>
  <BaseModal v-model="show" title="管理员审核面板" maxWidth="1145px">
    <div class="admin-panel">
      <div class="panel-header">
        <div class="tab-bar">
          <button
            class="tab-btn"
            :class="{ active: activeTab === 'pending' }"
            @click="activeTab = 'pending'"
          >
            待审核（{{ entries.length }}）
          </button>
        </div>
      </div>

      <!-- 待审核 -->
      <template v-if="activeTab === 'pending'">
        <div v-if="loading" class="panel-loading">加载中...</div>
        <div v-else-if="entries.length === 0" class="panel-empty">
          暂无待审核条目
        </div>
        <div v-else class="review-list">
          <ReviewCard
            v-for="entry in entries"
            :key="entry.id"
            :entry="entry"
            :processing="processingId === entry.id"
            @approve="handleApprove"
            @reject="handleReject"
          />
        </div>
      </template>

      <!-- 已公示 -->
      <template v-if="activeTab === 'approved'">
        <div v-if="approvedEntries.length === 0" class="panel-empty">
          暂无已公示条目
        </div>
        <div v-else class="review-list">
          <div v-for="entry in approvedEntries" :key="entry.id" class="review-card">
            <div class="review-header">
              <h4><span class="field-label">游戏ID:</span> {{ entry.name }}</h4>
              <StarRating :modelValue="entry.severity" readonly showLabel />
            </div>
            <p class="review-behavior"><span class="field-label">行为描述:</span> {{ entry.behavior }}</p>
            <p v-if="entry.remark" class="review-remark"><span class="field-label">备注:</span> {{ entry.remark }}</p>
            <div class="review-meta">
              <span>{{ formatDate(entry.approvedAt || entry.submittedAt) }}</span>
            </div>
            <div class="review-actions">
              <button
                class="btn-remove"
                :disabled="processingId === entry.id"
                @click="handleRemove(entry)"
              >
                {{ processingId === entry.id ? '删除中...' : '删除' }}
              </button>
            </div>
          </div>
        </div>
      </template>

      <div v-if="actionError" class="action-error">{{ actionError }}</div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseModal from './BaseModal.vue'
import ReviewCard from './ReviewCard.vue'
import StarRating from './StarRating.vue'

const props = defineProps({
  modelValue: Boolean,
  entries: { type: Array, default: () => [] },
  approvedEntries: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  onApprove: { type: Function, default: null },
  onReject: { type: Function, default: null },
  onRemove: { type: Function, default: null },
})
const emit = defineEmits(['update:modelValue'])

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const activeTab = ref('pending')
const processingId = ref(null)
const actionError = ref('')

function formatDate(ts) {
  if (!ts) return ''
  return new Date(ts).toLocaleString('zh-CN')
}

async function handleApprove(entry) {
  processingId.value = entry.id
  actionError.value = ''
  try {
    await props.onApprove?.(entry)
  } catch (e) {
    actionError.value = '审核失败：' + e.message
  } finally {
    processingId.value = null
  }
}

async function handleReject(entry) {
  processingId.value = entry.id
  actionError.value = ''
  try {
    await props.onReject?.(entry)
  } catch (e) {
    actionError.value = '操作失败：' + e.message
  } finally {
    processingId.value = null
  }
}

async function handleRemove(entry) {
  processingId.value = entry.id
  actionError.value = ''
  try {
    await props.onRemove?.(entry)
  } catch (e) {
    actionError.value = '删除失败：' + e.message
  } finally {
    processingId.value = null
  }
}
</script>

<style scoped>
.admin-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tab-bar {
  display: flex;
  gap: 4px;
}

.tab-btn {
  background: var(--color-surface-hover);
  color: var(--color-text-secondary);
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  transition: background var(--transition), color var(--transition);
}
.tab-btn:hover {
  background: var(--color-border);
  color: var(--color-text);
}
.tab-btn.active {
  background: var(--color-primary);
  color: #fff;
}

.pending-count {
  font-weight: 500;
  color: var(--color-warning);
}

.panel-loading,
.panel-empty {
  text-align: center;
  padding: 30px;
  color: var(--color-text-secondary);
}

.review-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 60vh;
  overflow-y: auto;
}

.action-error {
  background: rgba(229, 62, 62, 0.1);
  border: 1px solid var(--color-danger);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  color: var(--color-danger);
  font-size: 0.85rem;
}

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

.review-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-remove {
  background: var(--color-danger);
  color: #fff;
  padding: 8px 18px;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 500;
  transition: background var(--transition);
}
.btn-remove:hover:not(:disabled) {
  background: #c53030;
}
.btn-remove:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .review-list {
    max-height: 70vh;
  }
}

@media (max-width: 480px) {
  .review-actions {
    flex-direction: column;
  }

  .btn-remove {
    width: 100%;
    text-align: center;
    padding: 10px 18px;
  }
}
</style>

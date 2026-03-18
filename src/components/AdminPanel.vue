<template>
  <BaseModal v-model="show" title="管理员审核面板" maxWidth="700px">
    <div class="admin-panel">
      <div class="panel-header">
        <span class="pending-count">待审核：{{ entries.length }}</span>
        <button class="btn-logout" @click="$emit('logout')">退出登录</button>
      </div>

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

      <div v-if="actionError" class="action-error">{{ actionError }}</div>
    </div>
  </BaseModal>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseModal from './BaseModal.vue'
import ReviewCard from './ReviewCard.vue'

const props = defineProps({
  modelValue: Boolean,
  entries: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'approve', 'reject', 'logout'])

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const processingId = ref(null)
const actionError = ref('')

async function handleApprove(entry) {
  processingId.value = entry.id
  actionError.value = ''
  try {
    await emit('approve', entry)
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
    await emit('reject', entry)
  } catch (e) {
    actionError.value = '操作失败：' + e.message
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

.pending-count {
  font-weight: 500;
  color: var(--color-warning);
}

.btn-logout {
  background: var(--color-surface-hover);
  color: var(--color-text-secondary);
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  transition: background var(--transition);
}
.btn-logout:hover {
  background: var(--color-border);
  color: var(--color-text);
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
</style>

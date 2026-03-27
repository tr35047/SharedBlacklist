<template>
  <BaseModal v-model="show" :title="title" maxWidth="420px">
    <div class="confirm-content">
      <p class="confirm-message">{{ message }}</p>
      <div class="confirm-actions">
        <button type="button" class="btn-cancel" @click="handleCancel">取消</button>
        <button type="button" class="btn-confirm" @click="handleConfirm">确认删除</button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import { computed } from 'vue'
import BaseModal from './BaseModal.vue'

const props = defineProps({
  modelValue: Boolean,
  title: { type: String, default: '确认删除' },
  message: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue', 'confirm', 'cancel'])

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

function handleCancel() {
  emit('cancel')
  show.value = false
}

function handleConfirm() {
  emit('confirm')
  show.value = false
}
</script>

<style scoped>
.confirm-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.confirm-message {
  color: var(--color-text);
  line-height: 1.7;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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

.btn-confirm {
  background: var(--color-danger);
  color: #fff;
  padding: 10px 20px;
  border-radius: var(--radius-sm);
  transition: background var(--transition);
}

.btn-confirm:hover {
  background: #c53030;
}
</style>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="modal-overlay" @click.self="close">
        <Transition name="slide-up">
          <div v-if="modelValue" class="modal-content" :style="{ maxWidth }">
            <div class="modal-header" v-if="title">
              <h3>{{ title }}</h3>
              <button class="modal-close" @click="close">&times;</button>
            </div>
            <div class="modal-body">
              <slot />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  modelValue: Boolean,
  title: { type: String, default: '' },
  maxWidth: { type: String, default: '500px' },
})

const emit = defineEmits(['update:modelValue'])

function close() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 0;
}

.modal-header h3 {
  font-size: 1.1rem;
  color: var(--color-text);
}

.modal-close {
  background: none;
  color: var(--color-text-secondary);
  font-size: 1.5rem;
  padding: 0 4px;
  line-height: 1;
  transition: color var(--transition);
}
.modal-close:hover {
  color: var(--color-text);
}

.modal-body {
  padding: 20px 24px 24px;
}

@media (max-width: 480px) {
  .modal-overlay {
    align-items: flex-end;
    padding: 0;
  }

  .modal-content {
    max-width: 100% !important;
    max-height: 90vh;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    border-bottom: none;
  }

  .modal-header {
    padding: 16px 16px 0;
  }

  .modal-body {
    padding: 16px 16px 20px;
  }
}
</style>

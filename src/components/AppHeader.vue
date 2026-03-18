<template>
  <header class="app-header">
    <div class="container header-inner">
      <div class="header-brand">
        <h1 class="header-title">SharedBlacklist</h1>
        <span class="header-subtitle">去中心化公示黑名单</span>
      </div>
      <div class="header-actions">
        <button class="btn-admin" @click="$emit('admin-click')">
          {{ isAdmin ? '审核面板' : '管理员' }}
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
defineProps({
  isAdmin: { type: Boolean, default: false },
})

defineEmits(['admin-click'])
</script>

<style scoped>
.app-header {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 50;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.header-brand {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.header-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-accent);
}

.header-subtitle {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.btn-admin {
  background: var(--color-surface-hover);
  color: var(--color-text-secondary);
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  transition: all var(--transition);
}
.btn-admin:hover {
  background: var(--color-border);
  color: var(--color-text);
}
</style>

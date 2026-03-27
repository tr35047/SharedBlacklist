<template>
  <header class="app-header">
    <div class="container header-inner">
      <div class="header-brand">
        <h1 class="header-title">星际酒馆</h1>
        <span class="header-subtitle">去中心化公示黑名单</span>
      </div>
      <div class="header-actions">
        <button class="btn-guide" title="使用说明" @click="$emit('guide-click')">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </button>
        <button class="btn-admin" @click="$emit('admin-click')">
          {{ adminButtonText }}
        </button>
        <button v-if="isAdmin" class="btn-logout" @click="$emit('logout')">
          退出登录
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isAdmin: { type: Boolean, default: false },
  pendingCount: { type: Number, default: 0 },
})

defineEmits(['admin-click', 'logout', 'guide-click'])

const adminButtonText = computed(() => {
  if (!props.isAdmin) return '管理员'
  return `审核面板（${props.pendingCount}）`
})
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
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-accent);
}

.header-subtitle {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-guide {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: var(--color-surface-hover);
  color: var(--color-text-secondary);
  border-radius: 50%;
  transition: all var(--transition);
}
.btn-guide:hover {
  background: var(--color-border);
  color: var(--color-text);
}

.btn-admin {
  background: var(--color-surface-hover);
  color: var(--color-text-secondary);
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  transition: all var(--transition);
}

.btn-logout {
  background: var(--color-surface-hover);
  color: var(--color-text-secondary);
  padding: 8px 14px;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  transition: all var(--transition);
}

.btn-admin:hover,
.btn-logout:hover {
  background: var(--color-border);
  color: var(--color-text);
}

@media (max-width: 480px) {
  .header-inner {
    height: 50px;
  }

  .header-title {
    font-size: 1.2rem;
  }

  .header-subtitle {
    display: none;
  }

  .btn-admin,
  .btn-logout {
    padding: 6px 10px;
    font-size: 0.8rem;
  }
}
</style>

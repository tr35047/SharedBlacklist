<template>
  <div class="blacklist-grid">
    <div v-if="loading" class="grid-loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>
    <div v-else-if="entries.length === 0" class="grid-empty">
      <p>暂无公示记录</p>
    </div>
    <div v-else class="grid-container">
      <BlacklistCard
        v-for="entry in entries"
        :key="entry.id"
        :entry="entry"
        @click="$emit('select', entry)"
      />
    </div>
  </div>
</template>

<script setup>
import BlacklistCard from './BlacklistCard.vue'

defineProps({
  entries: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
})

defineEmits(['select'])
</script>

<style scoped>
.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.grid-loading,
.grid-empty {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-text-secondary);
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--color-border);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  margin: 0 auto 12px;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

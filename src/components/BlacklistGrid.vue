<template>
  <div class="blacklist-grid">
    <div class="grid-toolbar">
      <div class="search-wrapper">
        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          :value="searchKeyword"
          type="search"
          class="search-input"
          placeholder="搜索名称…"
          @input="$emit('update:searchKeyword', $event.target.value)"
        />
        <button
          v-if="searchKeyword"
          class="search-clear"
          @click="$emit('update:searchKeyword', '')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="sort-wrapper">
        <svg class="sort-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="4" y1="6" x2="20" y2="6"/>
          <line x1="4" y1="12" x2="14" y2="12"/>
          <line x1="4" y1="18" x2="8" y2="18"/>
        </svg>
        <select
          :value="sortBy"
          class="sort-select"
          @change="$emit('update:sortBy', $event.target.value)"
        >
          <option value="latest">最新公示</option>
          <option value="severity">严重等级</option>
          <option value="count">上榜次数</option>
        </select>
      </div>
    </div>
    <div v-if="actionError" class="grid-error">{{ actionError }}</div>
    <div v-if="loading" class="grid-loading">
      <div class="spinner"></div>
      <p>加载中...</p>
    </div>
    <div v-else-if="entries.length === 0" class="grid-empty">
      <p>{{ searchKeyword ? '没有匹配的公示记录' : '暂无公示记录' }}</p>
    </div>
    <div v-else class="grid-container">
      <BlacklistCard
        v-for="entry in entries"
        :key="entry.id"
        :entry="entry"
        :isAdmin="isAdmin"
        :removing="processingId === entry.id"
        @click="$emit('select', entry)"
        @remove="handleRemove"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import BlacklistCard from './BlacklistCard.vue'

const props = defineProps({
  entries: { type: Array, default: () => [] },
  isAdmin: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  onRemove: { type: Function, default: null },
  searchKeyword: { type: String, default: '' },
  sortBy: { type: String, default: 'latest' },
})

defineEmits(['select', 'update:searchKeyword', 'update:sortBy'])

const processingId = ref(null)
const actionError = ref('')

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
.blacklist-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.grid-toolbar {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

/* -- Search -- */
.search-wrapper {
  position: relative;
  width: min(360px, 100%);
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--color-text-secondary);
  pointer-events: none;
  transition: color var(--transition);
}

.search-wrapper:focus-within .search-icon {
  color: var(--color-accent);
}

.search-input {
  width: 100%;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  height: 40px;
  padding: 0 36px 0 36px;
  box-sizing: border-box;
  color: var(--color-text);
  font-size: 0.9rem;
  outline: none;
  transition: border-color var(--transition), box-shadow var(--transition), background var(--transition);
}

.search-input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
  background: var(--color-surface-hover);
}

.search-input::placeholder {
  color: var(--color-text-secondary);
}

/* hide native clear button */
.search-input::-webkit-search-cancel-button {
  -webkit-appearance: none;
  appearance: none;
}

.search-clear {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: transparent;
  color: var(--color-text-secondary);
  transition: background var(--transition), color var(--transition);
}

.search-clear svg {
  width: 14px;
  height: 14px;
}

.search-clear:hover {
  background: var(--color-border);
  color: var(--color-text);
}

/* -- Sort -- */
.sort-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.sort-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 15px;
  height: 15px;
  color: var(--color-text-secondary);
  pointer-events: none;
  transition: color var(--transition);
}

.sort-wrapper:focus-within .sort-icon {
  color: var(--color-accent);
}

.sort-select {
  min-width: 132px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  height: 40px;
  padding: 0 12px 0 32px;
  box-sizing: border-box;
  color: var(--color-text);
  font-size: 0.9rem;
  outline: none;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  transition: border-color var(--transition), box-shadow var(--transition), background-color var(--transition);
}

.sort-select:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
  background-color: var(--color-surface-hover);
}

.sort-select:hover {
  background-color: var(--color-surface-hover);
}

.grid-error {
  background: rgba(229, 62, 62, 0.1);
  border: 1px solid var(--color-danger);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  color: var(--color-danger);
  font-size: 0.85rem;
}

.grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, 280px);
  justify-content: start;
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

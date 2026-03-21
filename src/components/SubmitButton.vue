<template>
  <button class="submit-btn" @click="$emit('click')">
    <span class="submit-icon">+</span>
    提交举报
  </button>
</template>

<script setup>
defineEmits(['click'])
</script>

<style scoped>
.submit-btn {
  position: fixed;
  bottom: 64px;
  right: 32px;
  background: var(--color-accent);
  color: #fff;
  border-radius: 50px;
  padding: 14px 28px;
  font-size: 1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: var(--shadow-lg);
  transition: background var(--transition), transform var(--transition);
  z-index: 100;
}
.submit-btn:hover {
  background: var(--color-accent-hover);
  transform: scale(1.05);
}

.submit-icon {
  font-size: 1.3rem;
  font-weight: 700;
}
</style>

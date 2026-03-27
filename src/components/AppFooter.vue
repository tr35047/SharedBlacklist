<template>
  <footer class="app-footer">
    <div class="container footer-inner">
      <div class="footer-status">
        <span class="status-dot" :class="{ online: connected }"></span>
        <span class="status-text">
          {{ connected ? `已连接 (${peerCount} peer)` : '未连接 relay' }}
        </span>
      </div>
      <div class="footer-info">
        数据通过 P2P 网络同步 · 无中心服务器
      </div>
    </div>
  </footer>
</template>

<script setup>
defineProps({
  connected: { type: Boolean, default: false },
  peerCount: { type: Number, default: 0 },
})
</script>

<style scoped>
.app-footer {
  margin-top: auto;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding: 12px 0;
}

.footer-inner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.footer-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.footer-info {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-danger);
  transition: background var(--transition);
}
.status-dot.online {
  background: var(--color-success);
}

@media (max-width: 640px) {
  .footer-inner {
    position: static;
    flex-direction: column;
    gap: 6px;
  }

  .footer-info {
    position: static;
    transform: none;
  }
}
</style>

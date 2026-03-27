<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="guide-overlay" @click.self="close">
        <Transition name="slide-up">
          <div v-if="modelValue" class="guide-content">
            <div class="guide-header">
              <h3>使用说明</h3>
              <button class="guide-close" @click="close">&times;</button>
            </div>
            <div class="guide-body">
              <ul class="guide-list">
                <li>本平台为去中心化公示黑名单，数据通过 P2P 网络同步，无中心服务器。</li>
                <li>首页展示已审核通过的公示记录，点击卡片可查看详细信息。</li>
                <li>点击右下角 <strong>「提交举报」</strong> 按钮可提交新的举报，提交后需等待管理员审核。</li>
                <li>支持按 <strong>最新公示、严重等级、上榜次数</strong> 排序，也可通过搜索栏快速查找。</li>
                <li>严重程度以星级表示，星级越高代表行为越恶劣。</li>
                <li>提交的数据管理员只有审核权限，不对名单进行删除，多次上榜的玩家会叠加，排名靠前公示。</li>
                <li>希望这个平台可以帮助大家建立和谐的游戏环境。</li>
              </ul>
            </div>
            <div class="guide-footer">
              <button class="btn-dismiss-today" @click="dismissToday">今日关闭</button>
              <button class="btn-close" @click="close">关闭</button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const STORAGE_KEY = 'guide_dismissed_date'

defineProps({
  modelValue: Boolean,
})

const emit = defineEmits(['update:modelValue'])

function close() {
  emit('update:modelValue', false)
}

function dismissToday() {
  const today = new Date().toISOString().slice(0, 10)
  localStorage.setItem(STORAGE_KEY, today)
  emit('update:modelValue', false)
}
</script>

<style scoped>
.guide-overlay {
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

.guide-content {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 480px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
}

.guide-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 0;
}

.guide-header h3 {
  font-size: 1.1rem;
  color: var(--color-text);
}

.guide-close {
  background: none;
  color: var(--color-text-secondary);
  font-size: 1.5rem;
  padding: 0 4px;
  line-height: 1;
  transition: color var(--transition);
}
.guide-close:hover {
  color: var(--color-text);
}

.guide-body {
  padding: 20px 24px;
}

.guide-welcome {
  font-size: 0.95rem;
  margin-bottom: 16px;
  color: var(--color-text);
}

.guide-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.guide-list li {
  position: relative;
  padding-left: 20px;
  font-size: 0.88rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
}

.guide-list li::before {
  content: '·';
  position: absolute;
  left: 4px;
  top: 0;
  color: var(--color-accent);
  font-weight: 700;
  font-size: 1.1rem;
}

.guide-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 0 24px 20px;
}

.btn-dismiss-today {
  background: var(--color-surface-hover);
  color: var(--color-text-secondary);
  padding: 8px 18px;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  transition: background var(--transition), color var(--transition);
}
.btn-dismiss-today:hover {
  background: var(--color-border);
  color: var(--color-text);
}

.btn-close {
  background: var(--color-accent);
  color: #fff;
  padding: 8px 18px;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  font-weight: 500;
  transition: background var(--transition);
}
.btn-close:hover {
  background: var(--color-accent-hover);
}

@media (max-width: 480px) {
  .guide-overlay {
    align-items: flex-end;
    padding: 0;
  }

  .guide-content {
    max-width: 100%;
    max-height: 90vh;
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    border-bottom: none;
  }

  .guide-header {
    padding: 16px 16px 0;
  }

  .guide-body {
    padding: 14px 16px;
  }

  .guide-list {
    gap: 10px;
  }

  .guide-list li {
    font-size: 0.84rem;
    padding-left: 16px;
  }

  .guide-footer {
    padding: 0 16px 20px;
    flex-direction: column;
  }

  .btn-dismiss-today,
  .btn-close {
    width: 100%;
    text-align: center;
    padding: 10px 18px;
  }
}
</style>

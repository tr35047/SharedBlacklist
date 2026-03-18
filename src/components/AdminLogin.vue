<template>
  <BaseModal v-model="show" title="管理员登录" maxWidth="400px">
    <form @submit.prevent="handleLogin" class="login-form">
      <div class="form-group">
        <label>管理员密码</label>
        <input
          v-model="password"
          type="password"
          placeholder="请输入管理员密码"
          autocomplete="off"
        />
      </div>

      <div v-if="loginError" class="form-error">{{ loginError }}</div>

      <div class="form-actions">
        <button type="button" class="btn-cancel" @click="show = false">取消</button>
        <button type="submit" class="btn-submit" :disabled="loggingIn">
          {{ loggingIn ? '验证中...' : '登录' }}
        </button>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseModal from './BaseModal.vue'

const props = defineProps({
  modelValue: Boolean,
  loginError: { type: String, default: '' },
  loggingIn: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'login'])

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const password = ref('')

function handleLogin() {
  if (!password.value.trim()) return
  emit('login', password.value)
  password.value = ''
}
</script>

<style scoped>
.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.form-group input {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  color: var(--color-text);
  outline: none;
  transition: border-color var(--transition);
}
.form-group input:focus {
  border-color: var(--color-accent);
}

.form-error {
  background: rgba(229, 62, 62, 0.1);
  border: 1px solid var(--color-danger);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  color: var(--color-danger);
  font-size: 0.85rem;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
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

.btn-submit {
  background: var(--color-accent);
  color: #fff;
  padding: 10px 24px;
  border-radius: var(--radius-sm);
  font-weight: 500;
  transition: background var(--transition);
}
.btn-submit:hover:not(:disabled) {
  background: var(--color-accent-hover);
}
.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

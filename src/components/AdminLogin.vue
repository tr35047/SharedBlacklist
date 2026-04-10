<template>
  <BaseModal v-model="show" title="管理员登录" maxWidth="400px">
    <form @submit.prevent="handleLogin" class="login-form">
      <div class="login-mode-toggle">
        <button type="button" :class="{ active: mode === 'password' }" @click="mode = 'password'">密码登录</button>
        <button type="button" :class="{ active: mode === 'keypair' }" @click="mode = 'keypair'">密钥对登录</button>
      </div>

      <div v-if="mode === 'password'" class="form-group">
        <label>管理员密码</label>
        <input
          v-model="password"
          type="password"
          placeholder="请输入管理员密码"
          autocomplete="off"
        />
      </div>

      <div v-if="mode === 'keypair'" class="form-group">
        <label>密钥对 JSON</label>
        <textarea
          v-model="pairJson"
          placeholder='粘贴完整密钥对 {"pub":"...","priv":"...","epub":"...","epriv":"..."}'
          rows="4"
        ></textarea>
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
const emit = defineEmits(['update:modelValue', 'login', 'loginWithPair'])

const show = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const mode = ref('password')
const password = ref('')
const pairJson = ref('')

function handleLogin() {
  if (mode.value === 'password') {
    if (!password.value.trim()) return
    emit('login', password.value)
    password.value = ''
  } else {
    if (!pairJson.value.trim()) return
    emit('loginWithPair', pairJson.value)
    pairJson.value = ''
  }
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

.login-mode-toggle {
  display: flex;
  gap: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}
.login-mode-toggle button {
  flex: 1;
  padding: 8px 12px;
  font-size: 0.82rem;
  background: var(--color-bg);
  color: var(--color-text-secondary);
  border: none;
  cursor: pointer;
  transition: background var(--transition), color var(--transition);
}
.login-mode-toggle button.active {
  background: var(--color-accent);
  color: #fff;
}

.form-group input,
.form-group textarea {
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 10px 12px;
  color: var(--color-text);
  outline: none;
  transition: border-color var(--transition);
  font-family: inherit;
  font-size: inherit;
  resize: vertical;
}
.form-group input:focus,
.form-group textarea:focus {
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

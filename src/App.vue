<template>
	<div id="app-root">
		<AppHeader
			:isAdmin="isAdmin"
			@admin-click="handleAdminClick"
		/>

		<main class="container main-content">
			<BlacklistGrid
				:entries="entries"
				:loading="loading"
				@select="selectedEntry = $event"
			/>
		</main>

		<AppFooter :connected="connected" :peerCount="peerCount"/>

		<!-- 提交按钮 + 弹窗 -->
		<SubmitButton @click="showSubmit = true"/>
		<SubmitModal v-model="showSubmit"/>

		<!-- 备注详情弹窗 -->
		<RemarkModal :entry="selectedEntry" @close="selectedEntry = null"/>

		<!-- 管理员登录弹窗 -->
		<AdminLogin
			v-model="showLogin"
			:loginError="loginError"
			:loggingIn="loggingIn"
			@login="handleLogin"
		/>

		<!-- 管理员审核面板 -->
		<AdminPanel
			v-model="showPanel"
			:entries="pendingEntries"
			:approvedEntries="entries"
			:loading="pendingLoading"
			:onApprove="handleApprove"
			:onReject="handleReject"
			:onRemove="handleRemove"
			@logout="handleLogout"
		/>
	</div>
</template>

<script setup>
import {ref} from 'vue'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import BlacklistGrid from './components/BlacklistGrid.vue'
import BlacklistCard from './components/BlacklistCard.vue'
import RemarkModal from './components/RemarkModal.vue'
import SubmitButton from './components/SubmitButton.vue'
import SubmitModal from './components/SubmitModal.vue'
import AdminLogin from './components/AdminLogin.vue'
import AdminPanel from './components/AdminPanel.vue'
import {useBlacklist} from './composables/useBlacklist.js'
import {usePending} from './composables/usePending.js'
import {useAdmin} from './composables/useAdmin.js'
import {useRelayStatus} from './composables/useRelayStatus.js'

// 公示名单
const {entries, loading} = useBlacklist()

// 待审核名单
const {entries: pendingEntries, loading: pendingLoading} = usePending()

// 管理员
const {isAdmin, loginError, loggingIn, login, logout, approve, reject, remove} = useAdmin()

// 连接状态
const {connected, peerCount} = useRelayStatus()

// UI 状态
const selectedEntry = ref(null)
const showSubmit = ref(false)
const showLogin = ref(false)
const showPanel = ref(false)

function handleAdminClick() {
	if (isAdmin.value) {
		showPanel.value = true
	} else {
		showLogin.value = true
	}
}

async function handleLogin(password) {
	await login(password)
	if (isAdmin.value) {
		showLogin.value = false
		showPanel.value = true
	}
}

async function handleApprove(entry) {
	await approve(entry)
}

async function handleReject(entry) {
	await reject(entry)
}

async function handleRemove(entry) {
	await remove(entry)
}

function handleLogout() {
	logout()
	showPanel.value = false
}
</script>

<style scoped>
#app-root {
	display: flex;
	flex-direction: column;
	min-height: 100vh;
}

.main-content {
	width: 100%;
	padding: 24px;
	flex: 1;
	overflow-y: auto;
}
</style>

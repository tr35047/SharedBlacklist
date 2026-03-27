<template>
	<div id="app-root">
		<AppHeader
			:isAdmin="isAdmin"
			:pendingCount="pendingEntries.length"
			@admin-click="handleAdminClick"
			@logout="handleLogout"
		/>

		<main class="container main-content">
			<BlacklistGrid
				:entries="filteredGroups"
				:isAdmin="isAdmin"
				:loading="loading"
				:onRemove="handleRemoveGroup"
				:searchKeyword="searchKeyword"
				:sortBy="sortBy"
				@select="selectedGroup = $event"
				@update:searchKeyword="searchKeyword = $event"
				@update:sortBy="sortBy = $event"
			/>
		</main>

		<AppFooter :connected="connected" :peerCount="peerCount"/>

		<!-- 提交按钮 + 弹窗 -->
		<SubmitButton @click="showSubmit = true"/>
		<SubmitModal v-model="showSubmit"/>

		<!-- 备注详情弹窗 -->
		<RemarkModal :group="selectedGroup" @close="selectedGroup = null"/>

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
		/>

		<ConfirmModal
			v-model="showDeleteConfirm"
			:message="deleteConfirmMessage"
			@confirm="handleConfirmDelete"
			@cancel="handleCancelDelete"
		/>
	</div>
</template>

<script setup>
import {computed, ref} from 'vue'
import AppHeader from './components/AppHeader.vue'
import AppFooter from './components/AppFooter.vue'
import BlacklistGrid from './components/BlacklistGrid.vue'
import RemarkModal from './components/RemarkModal.vue'
import SubmitButton from './components/SubmitButton.vue'
import SubmitModal from './components/SubmitModal.vue'
import AdminLogin from './components/AdminLogin.vue'
import AdminPanel from './components/AdminPanel.vue'
import ConfirmModal from './components/ConfirmModal.vue'
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
const selectedGroup = ref(null)
const searchKeyword = ref('')
const sortBy = ref('latest')
const showSubmit = ref(false)
const showLogin = ref(false)
const showPanel = ref(false)
const showDeleteConfirm = ref(false)
const deleteConfirmMessage = ref('')
const pendingDeleteResolver = ref(null)
const pendingDeleteGroup = ref(null)

const groupedEntries = computed(() => {
	const groups = new Map()

	for (const entry of entries.value) {
		const name = (entry.name || '').trim()
		const key = name || '未命名'
		const existing = groups.get(key)

		if (existing) {
			existing.records.push(entry)
			existing.count += 1
			if ((entry.approvedAt || entry.submittedAt || 0) > (existing.latestAt || 0)) {
				existing.latestAt = entry.approvedAt || entry.submittedAt || 0
				existing.latestEntry = entry
			}
			if ((entry.severity || 0) > (existing.maxSeverity || 0)) {
				existing.maxSeverity = entry.severity || 0
			}
		} else {
			groups.set(key, {
				id: key,
				name: key,
				count: 1,
				records: [entry],
				latestEntry: entry,
				latestAt: entry.approvedAt || entry.submittedAt || 0,
				maxSeverity: entry.severity || 0,
			})
		}
	}

	return Array.from(groups.values())
		.map((group) => ({
			...group,
			records: [...group.records].sort((a, b) => (b.approvedAt || b.submittedAt || 0) - (a.approvedAt || a.submittedAt || 0)),
		}))
})

const filteredGroups = computed(() => {
	const keyword = searchKeyword.value.trim().toLowerCase()
	const matchedGroups = keyword
		? groupedEntries.value.filter((group) =>
			(group.name || '').toLowerCase().includes(keyword)
		)
		: groupedEntries.value

	return [...matchedGroups].sort((a, b) => {
		if (sortBy.value === 'severity') {
			if ((b.maxSeverity || 0) !== (a.maxSeverity || 0)) {
				return (b.maxSeverity || 0) - (a.maxSeverity || 0)
			}
			if ((b.count || 0) !== (a.count || 0)) {
				return (b.count || 0) - (a.count || 0)
			}
		} else if (sortBy.value === 'count') {
			if ((b.count || 0) !== (a.count || 0)) {
				return (b.count || 0) - (a.count || 0)
			}
			if ((b.maxSeverity || 0) !== (a.maxSeverity || 0)) {
				return (b.maxSeverity || 0) - (a.maxSeverity || 0)
			}
		}

		return (b.latestAt || 0) - (a.latestAt || 0)
	})
})

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

async function handleRemoveGroup(group) {
	const count = group.records?.length || 0
	if (count > 1) {
		deleteConfirmMessage.value = `“${group.name}” 下有 ${count} 条公示记录，是否全部删除？`
		pendingDeleteGroup.value = group
		const confirmed = await new Promise((resolve) => {
			pendingDeleteResolver.value = resolve
			showDeleteConfirm.value = true
		})
		if (!confirmed) return
	}

	for (const entry of group.records || []) {
		await remove(entry)
	}
}

function handleConfirmDelete() {
	pendingDeleteResolver.value?.(true)
	pendingDeleteResolver.value = null
	pendingDeleteGroup.value = null
	deleteConfirmMessage.value = ''
}

function handleCancelDelete() {
	pendingDeleteResolver.value?.(false)
	pendingDeleteResolver.value = null
	pendingDeleteGroup.value = null
	deleteConfirmMessage.value = ''
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

<template>
	<div
		class="blacklist-card"
		:style="cardStyle"
		@click="$emit('click')"
	>
		<div class="card-header">
			<h3 class="card-name">
				{{ entry.name }}
				<span v-if="entry.count > 1" class="card-count">x{{ entry.count }}次</span>
			</h3>
			<StarRating :modelValue="entry.maxSeverity || entry.latestEntry?.severity || 0" readonly/>
		</div>
		<p class="card-behavior">{{ entry.latestEntry?.behavior || '' }}</p>
		<div class="card-footer">
			<span class="card-date">{{ formatDate(entry.latestAt) }}</span>
			<div class="card-actions">
				<span class="card-remark-hint">查看详情</span>
				<button
					v-if="isAdmin"
					type="button"
					class="card-delete"
					:disabled="removing"
					@click.stop="$emit('remove', entry)"
				>
					{{ removing ? '删除中...' : '删除' }}
				</button>
			</div>
		</div>
	</div>
</template>

<script setup>
import {computed} from 'vue'
import StarRating from './StarRating.vue'
import {severityToBackground, severityToTextColor} from '../utils/severity.js'

const props = defineProps({
	entry: {type: Object, required: true},
	isAdmin: {type: Boolean, default: false},
	removing: {type: Boolean, default: false},
})

defineEmits(['click', 'remove'])

const cardStyle = computed(() => ({
	backgroundColor: 'var(--color-surface)',
	color: 'var(--color-text)',
	border: '1px solid var(--color-border)'
}))

function formatDate(ts) {
	if (!ts) return ''
	return new Date(ts).toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.blacklist-card {
	border-radius: var(--radius-md);
	padding: 16px;
	cursor: pointer;
	transition: transform var(--transition), box-shadow var(--transition);
	box-shadow: var(--shadow-sm);
}

.blacklist-card:hover {
	transform: translateY(-2px);
	box-shadow: var(--shadow-md);
}

@media (hover: none) {
	.blacklist-card:hover {
		transform: none;
		box-shadow: var(--shadow-sm);
	}
}

@media (max-width: 480px) {
	.blacklist-card {
		padding: 14px;
	}

	.card-name {
		font-size: 1rem;
	}

	.card-delete {
		padding: 6px 12px;
		font-size: 0.8rem;
		min-height: 32px;
	}
}

.card-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 8px;
}

.card-name {
	font-size: 1.1rem;
	font-weight: 600;
}

.card-count {
	margin-left: 6px;
	font-size: 0.85rem;
	color: var(--color-text-secondary);
}

.card-behavior {
	font-size: 0.9rem;
	opacity: 0.9;
	margin-bottom: 12px;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.card-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	font-size: 0.8rem;
	opacity: 0.7;
}

.card-actions {
	display: flex;
	align-items: center;
	gap: 8px;
}

.card-remark-hint {
	text-decoration: underline;
}

.card-delete {
	background: var(--color-danger);
	color: #fff;
	padding: 4px 10px;
	border-radius: var(--radius-sm);
	font-size: 0.75rem;
	opacity: 1;
	transition: background var(--transition), opacity var(--transition);
}

.card-delete:hover:not(:disabled) {
	background: #c53030;
}

.card-delete:disabled {
	opacity: 0.6;
	cursor: not-allowed;
}
</style>

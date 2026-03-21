<template>
	<div
		class="blacklist-card"
		:style="cardStyle"
		@click="$emit('click')"
	>
		<div class="card-header">
			<h3 class="card-name">{{ entry.name }}</h3>
			<StarRating :modelValue="entry.severity" readonly/>
		</div>
		<p class="card-behavior">{{ entry.behavior }}</p>
		<div class="card-footer">
			<span class="card-date">{{ formatDate(entry.approvedAt || entry.submittedAt) }}</span>
			<span v-if="entry.remark" class="card-remark-hint">查看备注</span>
		</div>
	</div>
</template>

<script setup>
import {computed} from 'vue'
import StarRating from './StarRating.vue'
import {severityToBackground, severityToTextColor} from '../utils/severity.js'

const props = defineProps({
	entry: {type: Object, required: true},
})

defineEmits(['click'])

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

.card-remark-hint {
	text-decoration: underline;
}
</style>

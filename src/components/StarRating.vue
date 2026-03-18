<template>
  <div class="star-rating" :class="{ interactive: !readonly }">
    <span
      v-for="i in 5"
      :key="i"
      class="star"
      :class="{ filled: i <= displayValue, half: i === Math.ceil(displayValue) && displayValue % 1 !== 0 }"
      @click="!readonly && select(i)"
      @mouseenter="!readonly && (hoverValue = i)"
      @mouseleave="!readonly && (hoverValue = 0)"
    >&#9733;</span>
    <span v-if="showLabel" class="star-label">{{ displayValue }}/5</span>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  modelValue: { type: Number, default: 0 },
  readonly: { type: Boolean, default: false },
  showLabel: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const hoverValue = ref(0)

const displayValue = computed(() => {
  if (!props.readonly && hoverValue.value) return hoverValue.value
  return props.modelValue
})

function select(val) {
  emit('update:modelValue', val)
}
</script>

<style scoped>
.star-rating {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}

.star {
  font-size: 1.2rem;
  color: #444;
  transition: color 0.15s;
}

.star.filled {
  color: #f59e0b;
}

.interactive .star {
  cursor: pointer;
}

.interactive .star:hover {
  color: #fbbf24;
}

.star-label {
  margin-left: 6px;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}
</style>

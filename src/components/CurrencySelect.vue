<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { displayName, flagForCurrency } from '../composables/useCurrencyMeta'

const props = defineProps({
  modelValue: { type: String, required: true },
  options: { type: Array, default: () => [] },
  label: { type: String, default: '' },
  placeholder: { type: String, default: 'Search currency' },
})
const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const search = ref('')
const rootEl = ref(null)
const inputEl = ref(null)
const activeIndex = ref(-1)

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  const list = q
    ? props.options.filter(c => {
        const name = displayName(c).toLowerCase()
        return name.includes(q) || c.toLowerCase().includes(q)
      })
    : props.options

  if (activeIndex.value >= list.length) activeIndex.value = list.length - 1
  return list
})

function open() {
  isOpen.value = true
  const i = filtered.value.indexOf(props.modelValue)
  activeIndex.value = i >= 0 ? i : 0

  nextTick(() => {
    inputEl.value?.focus()
  })
}

function close() {
  isOpen.value = false
  activeIndex.value = -1
  search.value = ''
}

function select(val) {
  emit('update:modelValue', val)
  close()
}

function onDocClick(e) {
  if (!rootEl.value) return
  if (!rootEl.value.contains(e.target)) close()
}

function onKeydown(e) {
  if (!isOpen.value) return

  if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeIndex.value = Math.min(activeIndex.value + 1, filtered.value.length - 1)
    scrollIntoView()
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeIndex.value = Math.max(activeIndex.value - 1, 0)
    scrollIntoView()
  } else if (e.key === 'Enter') {
    e.preventDefault()
    const v = filtered.value[activeIndex.value]
    if (v) select(v)
  } else if (e.key === 'Escape') {
    e.preventDefault()
    close()
  }
}

function scrollIntoView() {
  nextTick(() => {
    const listEl = rootEl.value.querySelector('ul')
    const activeEl = listEl?.children[activeIndex.value]
    activeEl?.scrollIntoView({ block: 'nearest' })
  })
}

onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))
</script>

<template>
  <div class="flex flex-col gap-1" ref="rootEl">
    <label v-if="label" class="text-xs text-slate-600">{{ label }}</label>

    <button type="button"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white flex items-center justify-between"
            @click="isOpen ? close() : open()">
      <div class="flex items-center gap-2 min-w-0">
        <span class="w-5 h-5 inline-flex items-center justify-center rounded bg-slate-100 border border-slate-200 shrink-0">{{ flagForCurrency(modelValue) }}</span>
        <span class="truncate">{{ displayName(modelValue) }}</span>
      </div>
      <span class="opacity-60">▾</span>
    </button>

    <div v-if="isOpen" class="relative z-10">
      <div class="absolute mt-1 w-full bg-white border border-slate-300 rounded-lg shadow-lg overflow-hidden">
        <div class="p-2 border-b border-slate-200 bg-slate-50">
          <input
            ref="inputEl"
            v-model.trim="search"
            :placeholder="placeholder"
            class="w-full px-2 py-1.5 border border-slate-300 rounded focus:outline-none"
            type="text"
            @keydown="onKeydown"
          />
        </div>
        <ul class="max-h-64 overflow-auto" role="listbox">
          <li v-for="(c, i) in filtered" :key="c">
            <button
              type="button"
              class="w-full text-left px-3 py-2 flex items-center gap-3"
              :class="[ i === activeIndex ? 'bg-slate-100' : 'hover:bg-slate-50' ]"
              @mousedown.prevent="select(c)"
              role="option"
              :aria-selected="i === activeIndex"
            >
              <span class="w-6 h-6 inline-flex items-center justify-center rounded bg-slate-100 border border-slate-200">{{ flagForCurrency(c) }}</span>
              <span class="truncate">{{ displayName(c) }}</span>
            </button>
          </li>
          <li v-if="filtered.length === 0" class="px-3 py-2 text-slate-500 text-sm">No results</li>
        </ul>
      </div>
    </div>
  </div>
</template>

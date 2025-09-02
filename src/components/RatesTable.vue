<script setup>
import { computed } from 'vue'
import { displayName, flagForCurrency, formatRate } from '../composables/useCurrencyMeta'

const props = defineProps({
  base: { type: String, required: true },
  rows: { type: Array, default: () => [] }, // [{ code, rate }]
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  filter: { type: String, default: '' },
  hasMore: { type: Boolean, default: false },
})
const emit = defineEmits(['refresh', 'update:filter', 'load-more'])

const localFilter = computed({
  get: () => props.filter,
  set: v => emit('update:filter', v),
})
</script>

<template>
  <section class="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
    <div class="flex items-center justify-between gap-2 mb-3">
      <h2 class="text-lg font-semibold">Online sell rates</h2>
      <input type="text" v-model.trim="localFilter" class="px-3 py-2 border border-slate-300 rounded-lg w-64 max-w-[50vw]" placeholder="Filter by currency or rate" />
    </div>
    <div class="flex items-center justify-between text-xs text-slate-600 mb-2">
      <div>Base: {{ base }}</div>
      <button class="px-2 py-1 text-xs border border-slate-300 rounded-lg bg-sky-500 text-white disabled:opacity-60" :disabled="loading" @click="$emit('refresh')">Refresh</button>
    </div>

    <div class="overflow-auto border border-slate-200 rounded-lg" :class="{ 'opacity-60': loading }">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 sticky top-0">
          <tr>
            <th class="text-left p-3">Currency</th>
            <th class="text-right p-3">Online Sell Rate ({{ base }} →)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.code" class="border-t border-slate-200">
            <td class="p-3">
              <div class="flex items-center gap-3">
                <span class="w-7 h-7 inline-flex items-center justify-center rounded bg-slate-100 border border-slate-200">{{ flagForCurrency(row.code) }}</span>
                <div>
                  <div class="font-semibold">{{ displayName(row.code) }}</div>
                  <div class="text-xs text-slate-500">{{ row.code }}</div>
                </div>
              </div>
            </td>
            <td class="p-3 text-right">{{ formatRate(row.rate) }}</td>
          </tr>
        </tbody>
      </table>
      <div v-if="!loading && !error && rows.length === 0" class="p-4 text-center text-slate-500">No currencies match the filter.</div>
      <div v-if="error" class="m-3 p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm">{{ error }}</div>

      <div v-if="hasMore && !loading" class="p-3 flex justify-center">
        <button class="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50" @click="$emit('load-more')">Load more</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
</style>

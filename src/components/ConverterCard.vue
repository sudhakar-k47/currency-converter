<script setup>
import CurrencySelect from './CurrencySelect.vue'

const props = defineProps({
  amount: { type: Number, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  options: { type: Array, default: () => [] },
  converting: { type: Boolean, default: false },
  convertedText: { type: String, default: '—' },
  midText: { type: String, default: '' },
  error: { type: String, default: '' },
})
const emit = defineEmits(['update:amount', 'update:from', 'update:to', 'swap'])
</script>

<template>
  <section class="bg-white/60 backdrop-blur rounded-2xl border border-white/70 shadow-sm p-4">
    <div class="flex items-center justify-between mb-2">
      <h2 class="text-sm font-semibold text-slate-700">Check Exchange Rates</h2>
      <span v-if="midText" class="text-xs text-slate-600">{{ midText }}</span>
    </div>

    <!-- Selects row -->
    <div class="grid grid-cols-2 gap-3">
      <CurrencySelect :label="''" :options="options" :model-value="from" @update:modelValue="v => emit('update:from', v)" />
      <CurrencySelect :label="''" :options="options" :model-value="to" @update:modelValue="v => emit('update:to', v)" />
    </div>

    <!-- Amount / Result with center divider and swap button -->
    <div class="relative mt-4 rounded-2xl border border-violet-200 ring-1 ring-violet-200/60 bg-gradient-to-r from-violet-50 to-fuchsia-50 shadow">
      <div class="grid grid-cols-2">
        <!-- Amount input -->
        <div class="p-3">
          <label class="block text-xs text-slate-500 mb-1">Amount</label>
          <div class="rounded-xl bg-white/80 backdrop-blur-sm ring-1 ring-violet-200 focus-within:ring-2 focus-within:ring-violet-400 focus-within:ring-offset-0 shadow-sm">
            <input
              type="number"
              min="0"
              step="0.01"
              :value="amount"
              @input="e => emit('update:amount', Number(e.target.value))"
              class="w-full bg-transparent text-2xl font-semibold outline-none px-3 py-2 rounded-xl"
              placeholder="0.00"
            />
          </div>
        </div>

        <!-- Converted value display -->
        <div class="p-3">
          <label class="block text-xs text-slate-500 mb-1">Converted</label>
          <div class="text-2xl font-semibold min-h-[2.25rem] flex items-center" :class="{ 'opacity-60': converting }">
            <span v-if="error" class="text-red-700 text-sm">{{ error }}</span>
            <span v-else>{{ convertedText }}</span>
          </div>
        </div>
      </div>

      <!-- vertical divider -->
      <div class="pointer-events-none absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 h-10 w-px bg-violet-200"></div>

      <!-- Swap button floating over divider -->
      <div class="absolute -top-3 left-1/2 -translate-x-1/2">
        <button class="px-2 py-1 rounded-full bg-white border border-violet-200 shadow hover:bg-slate-50" @click="emit('swap')" title="Swap">⇄</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
</style>

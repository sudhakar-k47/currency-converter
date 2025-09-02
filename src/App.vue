<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import ConverterCard from './components/ConverterCard.vue'
import RatesTable from './components/RatesTable.vue'
import { getLatest, convertAmount } from './services/currencyApi'
import { displayName, CURRENCY_NAMES } from './composables/useCurrencyMeta'

// State
const amount = ref(100)
const from = ref('USD')
const to = ref('EUR')

const converting = ref(false)
const converted = ref(null)
const error = ref('')

const rates = ref({}) // { CODE: number }
const loadingRates = ref(false)
const ratesError = ref('')
const filter = ref('')

const currencyOptions = ref([])

// Pagination for rates table
const pageSize = 6
const fetchedCount = ref(0)

const formattedConverted = computed(() => {
  if (converted.value == null || isNaN(converted.value)) return '—'
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: to.value }).format(converted.value)
  } catch {
    return new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }).format(converted.value)
  }
})

const midRateText = computed(() => {
  const rate = rates.value[to.value]
  let val = rate
  if ((val == null || isNaN(val)) && amount.value > 0 && converted.value != null) {
    val = Number(converted.value) / Number(amount.value)
  }
  if (val == null || isNaN(val)) return ''
  const r = new Intl.NumberFormat(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 6 }).format(val)
  return `1 ${from.value} = ${r} ${to.value}`
})

// Build the master symbol order without fetching all
const allSymbols = computed(() => Object.keys(CURRENCY_NAMES))
const orderedSymbols = computed(() => {
  const majors = ['USD','EUR','GBP','AUD','CAD','JPY','INR']
  const majorList = majors.filter(c => allSymbols.value.includes(c))
  const rest = allSymbols.value.filter(c => !majorList.includes(c))
  // Exclude base from listing (rates API usually doesn't include base anyway)
  return [...majorList, ...rest].filter(c => c !== from.value)
})

const filteredRows = computed(() => {
  const q = filter.value.trim().toLowerCase()
  const rows = Object.keys(rates.value).map(code => ({ code, rate: rates.value[code] }))
    .sort((a, b) => a.code.localeCompare(b.code))
  if (!q) return rows
  return rows.filter(r => {
    const name = displayName(r.code).toLowerCase()
    return name.includes(q) || r.code.toLowerCase().includes(q) || String(r.rate).toLowerCase().includes(q)
  })
})

const hasMore = computed(() => {
  // If we haven't fetched all of the planned symbols
  const loaded = Object.keys(rates.value).length
  return loaded < orderedSymbols.value.length
})

async function fetchRates(symbols, { append } = { append: false }) {
  try {
    loadingRates.value = true
    ratesError.value = ''
    const data = await getLatest(from.value, symbols)
    const newRates = data.rates || {}
    if (append) {
      rates.value = { ...rates.value, ...newRates }
    } else {
      rates.value = newRates
    }
  } catch (e) {
    if (!append) rates.value = {}
    ratesError.value = e.message || String(e)
  } finally {
    loadingRates.value = false
  }
}

async function ensureRateFor(symbol) {
  if (!symbol) return
  if (rates.value[symbol] != null) return
  await fetchRates([symbol], { append: true })
}

function buildCurrencyOptions() {
  const majors = ['USD','EUR','GBP','AUD','CAD','JPY','INR']
  const all = orderedSymbols.value
  const withBase = [from.value, ...all]
  const unique = Array.from(new Set([...majors, ...withBase, ...allSymbols.value]))
  currencyOptions.value = unique
  if (!currencyOptions.value.includes(from.value)) from.value = currencyOptions.value[0]
  if (!currencyOptions.value.includes(to.value)) to.value = currencyOptions.value.find(c => c !== from.value) || to.value
}

async function loadFirstPage() {
  rates.value = {}
  fetchedCount.value = 0
  const slice = orderedSymbols.value.slice(0, pageSize)
  await fetchRates(slice, { append: false })
  fetchedCount.value = Object.keys(rates.value).length
}

async function loadMore() {
  if (loadingRates.value) return
  const loadedCodes = new Set(Object.keys(rates.value))
  let start = 0
  // find first index not yet loaded
  while (start < orderedSymbols.value.length && loadedCodes.has(orderedSymbols.value[start])) start++
  const slice = orderedSymbols.value.slice(start, start + pageSize)
  if (slice.length === 0) return
  await fetchRates(slice, { append: true })
  fetchedCount.value = Object.keys(rates.value).length
}

async function convertNow() {
  if (!amount.value || amount.value <= 0 || !from.value || !to.value) {
    converted.value = null
    return
  }
  try {
    converting.value = true
    error.value = ''
    const val = await convertAmount(from.value, to.value, amount.value)
    converted.value = Number(val)
  } catch (e) {
    const rate = rates.value[to.value]
    if (rate) {
      converted.value = Number(amount.value) * Number(rate)
      error.value = `Used latest rates as fallback (${e.message}).`
    } else {
      converted.value = null
      error.value = e.message || String(e)
    }
  } finally {
    converting.value = false
  }
}

function swap() {
  const tmp = from.value
  from.value = to.value
  to.value = tmp
}

async function refreshRates() {
  await loadFirstPage()
}

watch(from, async () => { buildCurrencyOptions(); await refreshRates(); convertNow() })
watch(to, async () => { await ensureRateFor(to.value); convertNow() })
watch(amount, convertNow)

onMounted(async () => {
  buildCurrencyOptions()
  await refreshRates()
  await ensureRateFor(to.value)
  await convertNow()
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-purple-200 via-fuchsia-200 to-violet-300">
    <div class="max-w-6xl mx-auto p-6 md:p-10  relative rounded-[28px] bg-white/80 backdrop-blur shadow-[0_20px_50px_rgba(124,58,237,0.25)] ring-1 ring-white/60">
      <header class="text-center mb-4">
        <h1 class="text-3xl font-bold">Currency Converter</h1>
        <p class="text-slate-600">Real-time conversion and live online sell rates</p>
      </header>
  
      <ConverterCard
        v-model:amount="amount"
        v-model:from="from"
        v-model:to="to"
        :options="currencyOptions"
        :converting="converting"
        :converted-text="formattedConverted"
        :mid-text="midRateText"
        :error="error"
        @swap="swap"
      />
  
      <RatesTable
        :base="from"
        :rows="filteredRows"
        :loading="loadingRates"
        :error="ratesError"
        :filter="filter"
        :has-more="hasMore"
        @update:filter="v => filter.value = v"
        @refresh="refreshRates"
        @load-more="loadMore"
      />
  
      <!-- <footer class="text-center mt-4 text-xs text-slate-500">Powered by CurrencyBeacon • Demo app</footer> -->
    </div>
  </div>
</template>

<style scoped>
/* Using Tailwind for styling */
</style>

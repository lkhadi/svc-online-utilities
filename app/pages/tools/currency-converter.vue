<template>
  <div class="tool-page">
    <div class="container">
      <NuxtLink to="/tools" class="back-link">
        <span class="back-icon">←</span> Back to Tools
      </NuxtLink>
      <div class="tool-header">
        <span class="utility-tag">Tools</span>
        <h1 class="tool-title">Currency Converter</h1>
        <p class="tool-description">
          Convert currencies and track exchange rates. Data provided by <a href="https://frankfurter.dev" target="_blank" rel="noopener noreferrer" class="credit-link">Frankfurter.dev</a>.
        </p>
      </div>

      <div class="tool-content">
        <div class="converter-card glass">
          <!-- Loading State -->
          <div v-if="loading" class="loading-state">
            <div class="spinner"></div>
            <p>Loading currencies...</p>
          </div>

          <!-- Error State -->
          <div v-else-if="error" class="error-state">
            <p class="error-text">{{ error }}</p>
            <button @click="fetchCurrencies" class="btn btn-primary">Retry</button>
          </div>

          <!-- Converter Interface -->
          <div v-else class="converter-interface">
            <div class="amount-input-group">
              <label class="input-label">Amount</label>
              <input 
                type="number" 
                v-model.number="amount" 
                min="0" 
                step="any" 
                class="amount-input"
                placeholder="Enter amount"
              >
            </div>

            <div class="currency-selectors">
              <div class="selector-group">
                <label class="input-label">From</label>
                <select v-model="baseCurrency" class="currency-select" @change="handleCurrencyChange">
                  <option v-for="(name, code) in currencies" :key="code" :value="code">
                    {{ code }}
                  </option>
                </select>
                <div class="currency-name">{{ currencies[baseCurrency] }}</div>
              </div>

              <button class="swap-button" @click="swapCurrencies" title="Swap currencies">
                ⇄
              </button>

              <div class="selector-group">
                <label class="input-label">To</label>
                <select v-model="targetCurrency" class="currency-select" @change="handleCurrencyChange">
                  <option v-for="(name, code) in currencies" :key="code" :value="code">
                    {{ code }}
                  </option>
                </select>
                <div class="currency-name">{{ currencies[targetCurrency] }}</div>
              </div>
            </div>

            <div class="result-display">
              <div class="conversion-result">
                <span class="amount">{{ formatCurrency(amount, baseCurrency) }}</span>
                <span class="equals">=</span>
                <span class="result">{{ result ? formatCurrency(result, targetCurrency) : '...' }}</span>
              </div>
              <div class="rate-info">
                1 {{ baseCurrency }} = {{ rate ? rate.toFixed(4) : '...' }} {{ targetCurrency }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Historical Chart -->
        <div class="chart-card glass" v-if="!loading && !error">
           <div class="chart-header">
             <h3 class="chart-title">30 Day Trend</h3>
             <div class="trend-indicator" :class="{ 'positive': trend > 0, 'negative': trend < 0 }">
               <span v-if="trend > 0">↗</span>
               <span v-else-if="trend < 0">↘</span>
               <span v-else>→</span>
               {{ Math.abs(trend).toFixed(2) }}%
             </div>
           </div>
           
           <div class="chart-container" v-if="chartData.length > 0">
             <svg class="trend-chart" viewBox="0 0 100 50" preserveAspectRatio="none">
               <!-- Gradient Definition -->
               <defs>
                 <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                   <stop offset="0%" stop-color="var(--color-accent-primary)" stop-opacity="0.2"/>
                   <stop offset="100%" stop-color="var(--color-accent-primary)" stop-opacity="0"/>
                 </linearGradient>
               </defs>
               
               <!-- Area Path -->
               <path 
                 :d="`M0,50 ${chartPath} V50 Z`" 
                 fill="url(#chartGradient)"
               />
               
               <!-- Line Path -->
               <path 
                 :d="chartPath" 
                 fill="none" 
                 stroke="var(--color-accent-primary)" 
                 stroke-width="0.5"
                 vector-effect="non-scaling-stroke"
               />
               
               <!-- Points (optional, filtered for performance/clutter) -->
               <!-- <circle v-for="(point, index) in chartPoints" :key="index" :cx="point.x" :cy="point.y" r="0.5" fill="var(--color-accent-primary)" /> -->
             </svg>
             
             <div class="chart-labels">
               <span>{{ formatDate(chartData[0].date) }}</span>
               <span>{{ formatDate(chartData[chartData.length - 1].date) }}</span>
             </div>
             
             <!-- Tooltip placeholder (simple implementation) -->
             <div class="high-low-labels">
                <span class="high-label">High: {{ highRate.toFixed(4) }}</span>
                <span class="low-label">Low: {{ lowRate.toFixed(4) }}</span>
             </div>
           </div>
           
           <div v-else class="chart-loading">
             Loading chart data...
           </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'

useSeoMeta({
  title: 'Currency Converter - meskipun.win',
  description: 'Convert between currencies and track historical exchange rates.',
})

const loading = ref(true)
const error = ref(null)
const currencies = ref({})
const amount = ref(1)
const baseCurrency = ref('USD')
const targetCurrency = ref('EUR')
const rate = ref(null)
const result = ref(null)

// Chart specific state
const chartData = ref([])
const trend = ref(0)
const highRate = ref(0)
const lowRate = ref(0)

const fetchCurrencies = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await fetch('https://api.frankfurter.dev/v1/currencies')
    if (!response.ok) throw new Error('Failed to fetch currencies')
    const data = await response.json()
    // data is { "AUD": "Australian Dollar", ... }
    currencies.value = data
    
    // Sort currencies
    const sorted = Object.keys(currencies.value).sort().reduce((acc, key) => {
      acc[key] = currencies.value[key]
      return acc
    }, {})
    currencies.value = sorted

    await updateAll()
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const updateAll = async () => {
    await updateRates()
    fetchHistory()
}

const handleCurrencyChange = () => {
    updateAll()
}

const updateRates = async () => {
  if (!baseCurrency.value || !targetCurrency.value) return
  
  // Basic optimization: if same currency, rate is 1
  if (baseCurrency.value === targetCurrency.value) {
      rate.value = 1
      result.value = amount.value
      return
  }
  
  try {
    const response = await fetch(`https://api.frankfurter.dev/v1/latest?amount=${amount.value}&from=${baseCurrency.value}&to=${targetCurrency.value}`)
    if (!response.ok) throw new Error('Failed to fetch rates')
    const data = await response.json()
    // calculated rate for 1 unit
    rate.value = data.rates[targetCurrency.value] / amount.value
    result.value = data.rates[targetCurrency.value]
  } catch (err) {
    console.error(err)
  }
}

const fetchHistory = async () => {
    chartData.value = []
    if (!baseCurrency.value || !targetCurrency.value || baseCurrency.value === targetCurrency.value) return

    const endDate = new Date().toISOString().split('T')[0]
    const startDateObj = new Date()
    startDateObj.setDate(startDateObj.getDate() - 30)
    const startDate = startDateObj.toISOString().split('T')[0]

    try {
        const response = await fetch(`https://api.frankfurter.dev/v1/${startDate}..${endDate}?from=${baseCurrency.value}&to=${targetCurrency.value}`)
        if (!response.ok) throw new Error('History fetch failed')
        const data = await response.json()
        
        const history = Object.entries(data.rates).map(([date, rates]) => ({
            date,
            rate: rates[targetCurrency.value]
        }))
        
        chartData.value = history
        
        // Calculate stats
        if (history.length > 0) {
            const startRate = history[0].rate
            const endRate = history[history.length - 1].rate
            trend.value = ((endRate - startRate) / startRate) * 100
            
            const rates = history.map(h => h.rate)
            highRate.value = Math.max(...rates)
            lowRate.value = Math.min(...rates)
        }
        
    } catch (err) {
        console.error('Failed to fetch history:', err)
    }
}

const swapCurrencies = () => {
  const temp = baseCurrency.value
  baseCurrency.value = targetCurrency.value
  targetCurrency.value = temp
  updateAll()
}

const formatCurrency = (val, currency) => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(val)
  } catch (e) {
    return `${val} ${currency}`
  }
}

const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)
}

// Chart SVG Path generation
const chartPath = computed(() => {
    if (chartData.value.length === 0) return ''
    
    const rates = chartData.value.map(d => d.rate)
    const min = Math.min(...rates)
    const max = Math.max(...rates)
    const range = max - min || 1 // Avoid division by zero
    
    // Create points normalized to 0-100 x and 0-50 y
    // We want higher values at top (y=0) and lower at bottom (y=50)
    const points = chartData.value.map((d, i) => {
        const x = (i / (chartData.value.length - 1)) * 100
        // rudimentary scaling with some padding
        const normalizedY = (d.rate - min) / range
        const y = 45 - (normalizedY * 40) // Keep within 5-45 to avoid edge clipping
        return `${x},${y}`
    })
    
    return `M${points.join(' L')}`
})

watch(amount, () => {
  if (rate.value) {
    result.value = amount.value * rate.value
  } else {
     updateRates()
  }
})

onMounted(() => {
  fetchCurrencies()
})
</script>

<style scoped>
.tool-page {
  padding: var(--spacing-4xl) 0;
  min-height: 80vh;
}

.tool-header {
  text-align: center;
  margin-bottom: var(--spacing-3xl);
}



.tool-title {
  font-size: var(--font-size-4xl);
  font-weight: 800;
  margin-bottom: var(--spacing-sm);
  letter-spacing: -0.02em;
}

.tool-description {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
}

.credit-link {
  color: var(--color-accent-primary);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.tool-content {
  max-width: 600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.converter-card {
  padding: var(--spacing-2xl);
  border-radius: var(--radius-2xl);
  background: var(--color-bg-glass);
  border: 1px solid var(--color-border);
}

.loading-state,
.error-state {
  text-align: center;
  padding: var(--spacing-xl);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-bg-secondary);
  border-top-color: var(--color-accent-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto var(--spacing-md);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.input-label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-xs);
}

.amount-input-group {
  margin-bottom: var(--spacing-xl);
}

.amount-input {
  width: 100%;
  padding: var(--spacing-lg);
  font-size: var(--font-size-2xl);
  font-weight: 700;
  background: var(--color-bg-secondary);
  border: 2px solid transparent;
  border-radius: var(--radius-xl);
  color: var(--color-text-primary);
  transition: all var(--transition-fast);
}

.amount-input:focus {
  outline: none;
  border-color: var(--color-accent-primary);
  background: var(--color-bg-primary);
}

.currency-selectors {
  display: flex;
  align-items: center; /* Changed from flex-end to center for better alignment */
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.selector-group {
  flex: 1;
}

.currency-select {
  width: 100%;
  padding: var(--spacing-md);
  font-size: var(--font-size-lg);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  color: var(--color-text-primary);
  cursor: pointer;
  appearance: none;
  font-weight: 600;
}

.currency-name {
  margin-top: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  text-align: center; /* Center the name label */
  min-height: 1.2em; /* Prevent layout jump if empty */
}

.swap-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  font-size: 1.5rem;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  /* Removed margin-bottom hack since we use align-items: center now */
}

.swap-button:hover {
  background: var(--color-bg-glass-hover);
  color: var(--color-accent-primary);
  transform: rotate(180deg);
}

.result-display {
  text-align: center;
  padding-top: var(--spacing-xl);
  margin-top: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.conversion-result {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--color-text-primary);
  flex-wrap: wrap;
  line-height: 1.2;
}

.result {
  color: var(--color-accent-primary);
  padding: var(--spacing-xs) var(--spacing-sm);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-md);
}

.rate-info {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  background: var(--color-bg-secondary);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-full);
}

/* Chart Styles */
.chart-card {
    padding: var(--spacing-xl);
    border-radius: var(--radius-xl);
    background: var(--color-bg-glass);
    border: 1px solid var(--color-border);
    margin-top: var(--spacing-xl);
}

.chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
}

.chart-title {
    font-size: var(--font-size-lg);
    font-weight: 600;
    color: var(--color-text-primary);
    margin: 0;
}

.trend-indicator {
    font-size: var(--font-size-sm);
    font-weight: 700;
    padding: var(--spacing-xs) var(--spacing-sm);
    border-radius: var(--radius-full);
    background: var(--color-bg-secondary);
    color: var(--color-text-secondary);
}

.trend-indicator.positive {
    color: #10b981;
    background: rgba(16, 185, 129, 0.1);
}

.trend-indicator.negative {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
}

.chart-container {
    position: relative;
    height: 200px;
    width: 100%;
}

.trend-chart {
    width: 100%;
    height: 100%;
    overflow: visible;
}

.chart-labels {
    display: flex;
    justify-content: space-between;
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
    margin-top: var(--spacing-xs);
}

.high-low-labels {
    display: flex;
    justify-content: space-between;
    margin-top: var(--spacing-sm);
    font-size: var(--font-size-xs);
    color: var(--color-text-secondary);
    border-top: 1px dashed var(--color-border);
    padding-top: var(--spacing-xs);
}

.chart-loading {
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-secondary);
}

@media (max-width: 600px) {
  .currency-selectors {
    flex-direction: column;
    align-items: center;
  }
  
  .selector-group {
    width: 100%;
  }
  
  .swap-button {
    transform: rotate(90deg);
    margin: var(--spacing-sm) 0;
  }
  
  .swap-button:hover {
    transform: rotate(270deg);
  }
}
</style>

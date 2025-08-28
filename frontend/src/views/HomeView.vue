<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useFlightDelayStore } from '@/stores/flightDelay'
import AirportSelect from '@/components/AirportSelect.vue'
import PredictionResults from '@/components/PredictionResults.vue'

const store = useFlightDelayStore()
const {
  airports,
  selectedAirport,
  selectedDate,
  prediction,
  loading,
  error,
  apiHealthy,
  topAirports,
  isFormValid,
} = storeToRefs(store)

// Computed properties for date constraints
const minDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
})

const maxDate = computed(() => {
  const nextYear = new Date()
  nextYear.setFullYear(nextYear.getFullYear() + 1)
  return nextYear.toISOString().split('T')[0]
})

// Methods
const handlePredict = () => {
  store.predictDelay()
}

const handleClear = () => {
  store.clearSelection()
}

const handleAirportSearch = async (query: string) => {
  return await store.searchAirports(query)
}

// Initialize store on component mount
onMounted(() => {
  store.init()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="bg-blue-600 p-2 rounded-lg">
              <svg class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-900">Flight Delay Predictor</h1>
              <p class="text-sm text-gray-600">Predict flight delays with machine learning</p>
            </div>
          </div>

          <!-- API Health Status -->
          <div class="flex items-center space-x-2">
            <div class="flex items-center space-x-1">
              <div
                :class="apiHealthy ? 'bg-green-400' : 'bg-red-400'"
                class="w-2 h-2 rounded-full"
              ></div>
              <span class="text-sm text-gray-600">
                {{ apiHealthy ? 'API Connected' : 'API Offline' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column: Form -->
        <div class="lg:col-span-2">
          <div class="card p-6">
            <h2 class="text-xl font-semibold text-gray-900 mb-6">Flight Delay Prediction</h2>

            <!-- Airport Selection -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2"> Select Airport </label>
              <AirportSelect
                v-model="selectedAirport"
                :airports="airports"
                :loading="loading"
                @search="handleAirportSearch"
              />
              <p v-if="selectedAirport" class="mt-2 text-sm text-gray-600">
                {{ selectedAirport.city }}, {{ selectedAirport.state }} •
                {{ selectedAirport.total_flights.toLocaleString() }} flights •
                {{ (selectedAirport.delay_rate * 100).toFixed(1) }}% delay rate
              </p>
            </div>

            <!-- Date Selection -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2"> Select Date </label>
              <input
                type="date"
                v-model="selectedDate"
                :min="minDate"
                :max="maxDate"
                class="form-input"
                placeholder="Select flight date"
              />
              <p class="mt-1 text-sm text-gray-500">Choose a date up to 1 year in the future</p>
            </div>

            <!-- Predict Button -->
            <div class="flex items-center space-x-4">
              <button
                @click="handlePredict"
                :disabled="!isFormValid || loading"
                class="btn-primary flex items-center space-x-2"
              >
                <svg
                  v-if="loading"
                  class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>{{ loading ? 'Predicting...' : 'Predict Delay' }}</span>
              </button>

              <button
                v-if="prediction || selectedAirport || selectedDate"
                @click="handleClear"
                class="btn-secondary"
              >
                Clear
              </button>
            </div>

            <!-- Error Message -->
            <div v-if="error" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <div class="flex items-start">
                <svg
                  class="h-5 w-5 text-red-400 mt-0.5 mr-3"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clip-rule="evenodd"
                  />
                </svg>
                <p class="text-sm text-red-700">{{ error }}</p>
              </div>
            </div>
          </div>

          <!-- Top Airports -->
          <div class="mt-8 card p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Popular Airports</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                v-for="airport in topAirports"
                :key="airport.airport_id"
                @click="selectedAirport = airport"
                class="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                :class="{
                  'border-blue-500 bg-blue-50': selectedAirport?.airport_id === airport.airport_id,
                }"
              >
                <div class="font-medium text-gray-900">{{ airport.airport_name }}</div>
                <div class="text-sm text-gray-600">{{ airport.city }}, {{ airport.state }}</div>
                <div class="text-xs text-gray-500 mt-1">
                  {{ airport.total_flights.toLocaleString() }} flights •
                  {{ (airport.delay_rate * 100).toFixed(1) }}% delays
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Results -->
        <div class="lg:col-span-1">
          <PredictionResults :prediction="prediction" :loading="loading" />
        </div>
      </div>
    </main>
  </div>
</template>

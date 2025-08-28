import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { FlightDelayAPI, type Airport, type PredictionResponse } from '@/services/api'

export const useFlightDelayStore = defineStore('flightDelay', () => {
  // State
  const airports = ref<Airport[]>([])
  const selectedAirport = ref<Airport | null>(null)
  const selectedDate = ref<string>('')
  const prediction = ref<PredictionResponse | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const apiHealthy = ref<boolean | null>(null)

  // Getters
  const topAirports = computed(() =>
    airports.value.sort((a, b) => b.total_flights - a.total_flights).slice(0, 10),
  )

  const isFormValid = computed(() => selectedAirport.value !== null && selectedDate.value !== '')

  const delayProbabilityPercent = computed(() =>
    prediction.value ? Math.round(prediction.value.delay_probability * 100) : 0,
  )

  const delayRiskLevel = computed(() => {
    if (!prediction.value) return 'unknown'
    const prob = prediction.value.delay_probability
    if (prob < 0.15) return 'low'
    if (prob < 0.25) return 'moderate'
    if (prob < 0.35) return 'high'
    return 'very-high'
  })

  const delayRiskColor = computed(() => {
    switch (delayRiskLevel.value) {
      case 'low':
        return 'text-green-600'
      case 'moderate':
        return 'text-yellow-600'
      case 'high':
        return 'text-orange-600'
      case 'very-high':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  })

  // Actions
  async function loadAirports() {
    try {
      loading.value = true
      error.value = null
      airports.value = await FlightDelayAPI.getAirports()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load airports'
      console.error('Error loading airports:', err)
    } finally {
      loading.value = false
    }
  }

  async function searchAirports(query: string): Promise<Airport[]> {
    try {
      if (query.length < 2) return []
      return await FlightDelayAPI.searchAirports(query)
    } catch (err) {
      console.error('Error searching airports:', err)
      return []
    }
  }

  async function predictDelay() {
    if (!selectedAirport.value || !selectedDate.value) {
      error.value = 'Please select both airport and date'
      return
    }

    try {
      loading.value = true
      error.value = null
      prediction.value = null

      prediction.value = await FlightDelayAPI.predictDelay({
        airport_id: selectedAirport.value.airport_id,
        date: selectedDate.value,
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to predict delay'
      console.error('Error predicting delay:', err)
    } finally {
      loading.value = false
    }
  }

  async function checkApiHealth() {
    apiHealthy.value = await FlightDelayAPI.healthCheck()
  }

  function clearPrediction() {
    prediction.value = null
    error.value = null
  }

  function clearSelection() {
    selectedAirport.value = null
    selectedDate.value = ''
    clearPrediction()
  }

  // Initialize store
  function init() {
    loadAirports()
    checkApiHealth()
  }

  return {
    // State
    airports,
    selectedAirport,
    selectedDate,
    prediction,
    loading,
    error,
    apiHealthy,

    // Getters
    topAirports,
    isFormValid,
    delayProbabilityPercent,
    delayRiskLevel,
    delayRiskColor,

    // Actions
    loadAirports,
    searchAirports,
    predictDelay,
    checkApiHealth,
    clearPrediction,
    clearSelection,
    init,
  }
})

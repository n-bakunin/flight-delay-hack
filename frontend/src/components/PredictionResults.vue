<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="loading" class="card p-6">
      <div class="text-center">
        <svg
          class="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4"
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
        <p class="text-gray-600 font-medium">Analyzing flight data...</p>
        <p class="text-sm text-gray-500 mt-1">Using machine learning to predict delays</p>
      </div>
    </div>

    <!-- Prediction Results -->
    <div v-else-if="prediction" class="space-y-6">
      <!-- Main Result Card -->
      <div class="card p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Delay Prediction</h3>

        <!-- Probability Display -->
        <div class="text-center mb-6">
          <div class="relative inline-flex items-center justify-center w-32 h-32 mb-4">
            <!-- Circular Progress -->
            <svg class="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="54" fill="none" stroke="#f3f4f6" stroke-width="8" />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                :stroke="circleColor"
                stroke-width="8"
                stroke-linecap="round"
                :stroke-dasharray="circumference"
                :stroke-dashoffset="dashOffset"
                class="transition-all duration-1000 ease-out"
              />
            </svg>

            <!-- Percentage Text -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="text-center">
                <div :class="delayRiskColor" class="text-3xl font-bold">
                  {{ delayProbabilityPercent }}%
                </div>
                <div class="text-xs text-gray-500 font-medium">DELAY CHANCE</div>
              </div>
            </div>
          </div>

          <!-- Risk Level Badge -->
          <div class="inline-flex items-center space-x-2">
            <div :class="riskBadgeColor" class="px-3 py-1 rounded-full text-sm font-medium">
              {{ riskLevelText }}
            </div>
            <div class="text-sm text-gray-600">
              Confidence: {{ Math.round(prediction.confidence * 100) }}%
            </div>
          </div>
        </div>

        <!-- Airport Info -->
        <div class="border-t pt-4">
          <div class="text-sm text-gray-600 space-y-1">
            <div>
              <span class="font-medium">Airport:</span>
              {{ prediction.airport_info.airport_name }}
            </div>
            <div>
              <span class="font-medium">Location:</span>
              {{ prediction.airport_info.city }}, {{ prediction.airport_info.state }}
            </div>
            <div>
              <span class="font-medium">Date:</span>
              {{ formattedDate }}
            </div>
          </div>
        </div>
      </div>

      <!-- Additional Details -->
      <div class="card p-6">
        <h4 class="text-md font-semibold text-gray-900 mb-3">Prediction Details</h4>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div class="text-gray-600">Month</div>
            <div class="font-medium">{{ monthName }}</div>
          </div>
          <div>
            <div class="text-gray-600">Day of Week</div>
            <div class="font-medium">{{ dayOfWeekName }}</div>
          </div>
        </div>

        <div class="mt-4 p-3 bg-gray-50 rounded-md">
          <p class="text-xs text-gray-600 leading-relaxed">
            This prediction is based on historical flight data and machine learning analysis.
            Factors considered include seasonal patterns, day of the week, and airport-specific
            delay rates. Weather conditions and other real-time factors are not included in this
            prediction.
          </p>
        </div>
      </div>

      <!-- Risk Interpretation -->
      <div class="card p-6">
        <h4 class="text-md font-semibold text-gray-900 mb-3">What This Means</h4>
        <div class="space-y-3">
          <div v-if="delayRiskLevel === 'low'" class="flex items-start space-x-3">
            <div class="bg-green-100 p-1 rounded-full">
              <svg class="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p class="font-medium text-green-800">Low Risk</p>
              <p class="text-sm text-green-600">
                Flights are likely to depart on time. Great choice for important appointments!
              </p>
            </div>
          </div>

          <div v-else-if="delayRiskLevel === 'moderate'" class="flex items-start space-x-3">
            <div class="bg-yellow-100 p-1 rounded-full">
              <svg class="h-4 w-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p class="font-medium text-yellow-800">Moderate Risk</p>
              <p class="text-sm text-yellow-600">
                Some chance of delays. Consider arriving at the airport a bit earlier than usual.
              </p>
            </div>
          </div>

          <div v-else-if="delayRiskLevel === 'high'" class="flex items-start space-x-3">
            <div class="bg-orange-100 p-1 rounded-full">
              <svg class="h-4 w-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p class="font-medium text-orange-800">High Risk</p>
              <p class="text-sm text-orange-600">
                Delays are more likely. Plan for extra time and consider travel insurance.
              </p>
            </div>
          </div>

          <div v-else class="flex items-start space-x-3">
            <div class="bg-red-100 p-1 rounded-full">
              <svg class="h-4 w-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div>
              <p class="font-medium text-red-800">Very High Risk</p>
              <p class="text-sm text-red-600">
                Significant delay risk. Consider alternative flights or dates if possible.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="card p-8">
      <div class="text-center">
        <svg
          class="h-16 w-16 text-gray-300 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1"
            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
          />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Ready for Prediction</h3>
        <p class="text-gray-600 mb-4">
          Select an airport and date to predict flight delay probability using machine learning.
        </p>
        <div class="text-sm text-gray-500">
          <p>🤖 AI-powered predictions based on historical flight data</p>
          <p>📊 Analyzes seasonal patterns and airport performance</p>
          <p>⚡ Get results in seconds</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { PredictionResponse } from '@/services/api'

// Props
interface Props {
  prediction: PredictionResponse | null
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

// Computed properties
const delayProbabilityPercent = computed(() =>
  props.prediction ? Math.round(props.prediction.delay_probability * 100) : 0,
)

const delayRiskLevel = computed(() => {
  if (!props.prediction) return 'unknown'
  const prob = props.prediction.delay_probability
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

const circleColor = computed(() => {
  switch (delayRiskLevel.value) {
    case 'low':
      return '#059669'
    case 'moderate':
      return '#d97706'
    case 'high':
      return '#ea580c'
    case 'very-high':
      return '#dc2626'
    default:
      return '#6b7280'
  }
})

const riskBadgeColor = computed(() => {
  switch (delayRiskLevel.value) {
    case 'low':
      return 'bg-green-100 text-green-800'
    case 'moderate':
      return 'bg-yellow-100 text-yellow-800'
    case 'high':
      return 'bg-orange-100 text-orange-800'
    case 'very-high':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
})

const riskLevelText = computed(() => {
  switch (delayRiskLevel.value) {
    case 'low':
      return 'Low Risk'
    case 'moderate':
      return 'Moderate Risk'
    case 'high':
      return 'High Risk'
    case 'very-high':
      return 'Very High Risk'
    default:
      return 'Unknown'
  }
})

// Circular progress calculations
const circumference = computed(() => 2 * Math.PI * 54) // radius = 54
const dashOffset = computed(() => {
  const progress = delayProbabilityPercent.value / 100
  return circumference.value * (1 - progress)
})

// Date formatting
const formattedDate = computed(() => {
  if (!props.prediction) return ''
  return new Date(props.prediction.prediction_details.requested_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const monthName = computed(() => {
  if (!props.prediction) return ''
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  return months[props.prediction.prediction_details.month - 1]
})

const dayOfWeekName = computed(() => {
  if (!props.prediction) return ''
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  // Convert from API format (1=Monday) to JS format (0=Sunday)
  const dayIndex =
    props.prediction.prediction_details.day_of_week === 7
      ? 0
      : props.prediction.prediction_details.day_of_week
  return days[dayIndex]
})
</script>

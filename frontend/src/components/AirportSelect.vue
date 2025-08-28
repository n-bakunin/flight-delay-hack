<template>
  <div class="relative">
    <!-- Dropdown Input -->
    <div class="relative">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="
          selectedAirport ? selectedAirport.airport_name : 'Search and select an airport...'
        "
        class="form-input pr-10"
        @input="handleInput"
        @focus="showDropdown = true"
        @blur="handleBlur"
        :disabled="loading"
      />

      <!-- Search/Loading Icon -->
      <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
        <svg
          v-if="searching"
          class="animate-spin h-5 w-5 text-gray-400"
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
        <svg
          v-else
          class="h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </div>

    <!-- Dropdown Results -->
    <div
      v-if="showDropdown && (searchResults.length > 0 || searchQuery.length >= 2)"
      class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-64 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none"
    >
      <!-- Loading State -->
      <div v-if="searching" class="px-4 py-3">
        <div class="flex items-center space-x-2">
          <svg class="animate-spin h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
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
          <span class="text-gray-600">Searching airports...</span>
        </div>
      </div>

      <!-- No Results -->
      <div
        v-else-if="searchQuery.length >= 2 && searchResults.length === 0"
        class="px-4 py-3 text-gray-500"
      >
        No airports found matching "{{ searchQuery }}"
      </div>

      <!-- Search Results -->
      <div
        v-for="airport in searchResults"
        :key="airport.airport_id"
        @mousedown.prevent="selectAirport(airport)"
        class="cursor-pointer select-none relative py-3 px-4 hover:bg-blue-50"
        :class="{ 'bg-blue-50': selectedAirport?.airport_id === airport.airport_id }"
      >
        <div class="flex items-center justify-between">
          <div>
            <div class="font-medium text-gray-900">{{ airport.airport_name }}</div>
            <div class="text-sm text-gray-600">{{ airport.city }}, {{ airport.state }}</div>
          </div>
          <div class="text-xs text-gray-500 text-right">
            <div>{{ airport.total_flights.toLocaleString() }} flights</div>
            <div>{{ (airport.delay_rate * 100).toFixed(1) }}% delays</div>
          </div>
        </div>
      </div>

      <!-- Show All Airports Option -->
      <div
        v-if="searchQuery.length === 0 && airports.length > 5"
        class="border-t border-gray-200 px-4 py-2"
      >
        <div class="text-sm text-gray-500">
          Showing top airports. Type to search all {{ airports.length }} airports.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { debounce } from 'lodash-es'
import type { Airport } from '@/services/api'

// Props
interface Props {
  modelValue: Airport | null
  airports: Airport[]
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

// Emits
interface Emits {
  'update:modelValue': [airport: Airport | null]
  search: [query: string]
}

const emit = defineEmits<Emits>()

// Local state
const searchQuery = ref('')
const searchResults = ref<Airport[]>([])
const showDropdown = ref(false)
const searching = ref(false)

// Computed
const selectedAirport = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// Debounced search function
const debouncedSearch = debounce(async (query: string) => {
  if (query.length < 2) {
    searchResults.value = props.airports.slice(0, 10) // Show top 10 airports
    searching.value = false
    return
  }

  searching.value = true
  try {
    // For now, use client-side filtering from the airports prop
    searchResults.value = props.airports.filter(
      (airport) =>
        airport.airport_name.toLowerCase().includes(query.toLowerCase()) ||
        airport.city.toLowerCase().includes(query.toLowerCase()) ||
        airport.state.toLowerCase().includes(query.toLowerCase()),
    )
    // Also emit the search event for the parent to handle if needed
    emit('search', query)
  } catch (error) {
    console.error('Search error:', error)
    searchResults.value = []
  } finally {
    searching.value = false
  }
}, 300)

// Methods
const handleInput = () => {
  showDropdown.value = true
  if (selectedAirport.value) {
    selectedAirport.value = null
  }
  debouncedSearch(searchQuery.value)
}

const handleBlur = () => {
  // Delay hiding dropdown to allow click events
  setTimeout(() => {
    showDropdown.value = false
  }, 200)
}

const selectAirport = (airport: Airport) => {
  selectedAirport.value = airport
  searchQuery.value = ''
  showDropdown.value = false
}

// Initialize search results
watch(
  () => props.airports,
  (newAirports) => {
    if (newAirports.length > 0 && searchResults.value.length === 0) {
      searchResults.value = newAirports.slice(0, 10)
    }
  },
  { immediate: true },
)

// Clear search when airport is selected externally
watch(selectedAirport, (newValue) => {
  if (newValue) {
    searchQuery.value = ''
  }
})
</script>

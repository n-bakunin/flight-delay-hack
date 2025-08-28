import axios from 'axios'

// API Configuration
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error)
    return Promise.reject(error)
  },
)

// Types
export interface Airport {
  airport_id: number
  airport_name: string
  city: string
  state: string
  total_flights: number
  delay_rate: number
}

export interface PredictionRequest {
  airport_id: number
  date: string
}

export interface PredictionResponse {
  delay_probability: number
  confidence: number
  airport_info: {
    airport_id: number
    airport_name: string
    city: string
    state: string
  }
  prediction_details: {
    month: number
    day_of_week: number
    requested_date: string
  }
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: string
}

// API Service
export class FlightDelayAPI {
  /**
   * Get all airports
   */
  static async getAirports(): Promise<Airport[]> {
    try {
      const response = await apiClient.get<ApiResponse<Airport[]>>('/airports')
      if (response.data.success && response.data.data) {
        return response.data.data
      }
      throw new Error(response.data.error || 'Failed to fetch airports')
    } catch (error) {
      console.error('Error fetching airports:', error)
      throw error
    }
  }

  /**
   * Get top airports by flight volume
   */
  static async getTopAirports(limit = 10): Promise<Airport[]> {
    try {
      const response = await apiClient.get<ApiResponse<Airport[]>>(`/airports/top?limit=${limit}`)
      if (response.data.success && response.data.data) {
        return response.data.data
      }
      throw new Error(response.data.error || 'Failed to fetch top airports')
    } catch (error) {
      console.error('Error fetching top airports:', error)
      throw error
    }
  }

  /**
   * Search airports by query
   */
  static async searchAirports(query: string): Promise<Airport[]> {
    try {
      const response = await apiClient.get<ApiResponse<Airport[]>>(
        `/airports/search?q=${encodeURIComponent(query)}`,
      )
      if (response.data.success && response.data.data) {
        return response.data.data
      }
      throw new Error(response.data.error || 'Failed to search airports')
    } catch (error) {
      console.error('Error searching airports:', error)
      throw error
    }
  }

  /**
   * Predict flight delay
   */
  static async predictDelay(request: PredictionRequest): Promise<PredictionResponse> {
    try {
      const response = await apiClient.post<ApiResponse<PredictionResponse>>('/predict', request)
      if (response.data.success && response.data.data) {
        return response.data.data
      }
      throw new Error(response.data.error || 'Failed to get prediction')
    } catch (error) {
      console.error('Error predicting delay:', error)
      throw error
    }
  }

  /**
   * Health check
   */
  static async healthCheck(): Promise<boolean> {
    try {
      const response = await apiClient.get('/health')
      return response.data.success
    } catch (error) {
      return false
    }
  }
}

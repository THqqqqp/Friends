import { apiClient } from './http'
import type { StatsChartResponse } from '@/types/api'

export async function fetchStatsChart() {
  const { data } = await apiClient.get<StatsChartResponse>('/stats/chart')
  return data
}

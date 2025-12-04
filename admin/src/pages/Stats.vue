<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import type { StatsChartResponse } from '@/types/api'
import { fetchStatsChart } from '@/services/statsService'

const stats = ref<StatsChartResponse | null>(null)
const loading = ref(false)
const feedback = ref('')
const trendRef = ref<HTMLDivElement>()
const collegeRef = ref<HTMLDivElement>()

let trendChart: echarts.ECharts | null = null
let collegeChart: echarts.ECharts | null = null

onMounted(() => {
  loadStats()
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  collegeChart?.dispose()
})

const totals = computed(() => ({
  generate: stats.value?.totals.generate || 0,
  download: stats.value?.totals.download || 0
}))

const collegeCount = computed(() => stats.value?.downloadByCollege.length || 0)

async function loadStats() {
  loading.value = true
  try {
    stats.value = await fetchStatsChart()
    await nextTick()
    initCharts()
  } catch (error) {
    console.error(error)
    feedback.value = '统计数据获取失败'
  } finally {
    loading.value = false
  }
}

function initCharts() {
  if (!stats.value) return
  if (trendRef.value) {
    trendChart = trendChart || echarts.init(trendRef.value)
    const labels = [...stats.value.dailyTrends].map((item) => item.day).reverse()
    const generateSeries = [...stats.value.dailyTrends].map((item) => item.generate).reverse()
    const downloadSeries = [...stats.value.dailyTrends].map((item) => item.download).reverse()
    trendChart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['生成次数', '下载次数'] },
      xAxis: { type: 'category', data: labels },
      yAxis: { type: 'value', minInterval: 1 },
      grid: { left: 40, right: 30, bottom: 40, top: 40 },
      series: [
        {
          name: '生成次数',
          type: 'line',
          smooth: true,
          data: generateSeries,
          areaStyle: { opacity: 0.15 }
        },
        {
          name: '下载次数',
          type: 'line',
          smooth: true,
          data: downloadSeries,
          areaStyle: { opacity: 0.15 }
        }
      ]
    })
  }
  if (collegeRef.value) {
    collegeChart = collegeChart || echarts.init(collegeRef.value)
    const colleges = stats.value.downloadByCollege.map((item) => item.college)
    const values = stats.value.downloadByCollege.map((item) => item.total)
    collegeChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'value',
        boundaryGap: [0, 0.01]
      },
      yAxis: {
        type: 'category',
        data: colleges
      },
      grid: { left: 120, right: 20, top: 20, bottom: 20 },
      series: [
        {
          type: 'bar',
          data: values,
          itemStyle: {
            color: '#3b82f6'
          },
          barWidth: 18
        }
      ]
    })
  }
}

function handleResize() {
  trendChart?.resize()
  collegeChart?.resize()
}
</script>

<template>
  <section class="space-y-6">
    <header class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-sm font-semibold text-primary-500 tracking-widest">统计面板</p>
        <h2 class="text-2xl font-bold text-slate-900">生成与下载数据</h2>
        <p class="text-sm text-slate-500">最近 30 天的生成次数与下载量趋势，支持实时刷新。</p>
      </div>
      <button
        type="button"
        class="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-600 hover:bg-slate-50"
        @click="loadStats"
      >
        刷新数据
      </button>
    </header>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div
        class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col gap-2"
      >
        <p class="text-xs tracking-widest text-slate-400">生成总数</p>
        <p class="text-3xl font-bold text-primary-600">{{ totals.generate }}</p>
        <p class="text-xs text-slate-400">近 30 天</p>
      </div>
      <div
        class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col gap-2"
      >
        <p class="text-xs tracking-widest text-slate-400">下载总数</p>
        <p class="text-3xl font-bold text-emerald-600">{{ totals.download }}</p>
        <p class="text-xs text-slate-400">近 30 天</p>
      </div>
      <div
        class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col gap-2"
      >
        <p class="text-xs tracking-widest text-slate-400">学院覆盖</p>
        <p class="text-3xl font-bold text-slate-900">
          {{ collegeCount }}
        </p>
        <p class="text-xs text-slate-400">有下载记录的学院</p>
      </div>
      <div
        class="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col gap-2"
      >
        <p class="text-xs tracking-widest text-slate-400">数据刷新</p>
        <p class="text-3xl font-bold text-slate-900">实时</p>
        <p class="text-xs text-slate-400">任何生成/下载都会记录</p>
      </div>
    </div>
    <div class="grid gap-6 lg:grid-cols-3">
      <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
        <p class="text-base font-semibold text-slate-800">生成 & 下载趋势</p>
        <p class="text-xs text-slate-400 mb-4">使用 ECharts 折线图呈现最近 30 天数据</p>
        <div ref="trendRef" class="h-80 w-full" />
      </div>
      <div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <p class="text-base font-semibold text-slate-800">学院下载排行</p>
        <p class="text-xs text-slate-400 mb-4">统计按学院聚合的下载次数</p>
        <div ref="collegeRef" class="h-80 w-full" />
      </div>
    </div>
    <p v-if="feedback" class="text-sm text-primary-600 font-medium">
      {{ feedback }}
    </p>
  </section>
</template>

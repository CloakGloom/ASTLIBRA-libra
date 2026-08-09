import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import { AccessoryCategory, ACC_CATEGORY_LABELS, ACC_CATEGORY_ORDER } from '../types'

interface Props {
  data: Record<AccessoryCategory, number>[]
}

const COLORS = ['#ff8c1a', '#2f81f7', '#46d369']

// 饰品十维能力雷达图（直接使用 echarts 原生 API，避免 StrictMode 兼容问题）
export function AccessoryRadarChart({ data }: Props) {
  const elRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!elRef.current) return
    const chart = echarts.init(elRef.current)
    chartRef.current = chart
    const onResize = () => chart.resize()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      chart.dispose()
      chartRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!chartRef.current) return
    const dims = ACC_CATEGORY_ORDER.map((c) => ({ key: c, name: ACC_CATEGORY_LABELS[c] }))
    // 统一上限：所有维度共用数据中的最大值，让强弱差异直观可见
    const globalMax = Math.max(...data.flatMap((d) => dims.map((dim) => Math.max(0, d[dim.key]))), 1)
    const indicator = dims.map((d) => ({ name: d.name, max: globalMax }))
    const seriesData = data.map((d, i) => ({
      value: dims.map((dim) => Math.max(0, d[dim.key])),
      name: `方案${i + 1}`,
      itemStyle: { color: COLORS[i % COLORS.length] },
      areaStyle: { opacity: 0.15 },
    }))
    chartRef.current.setOption(
      {
        backgroundColor: 'transparent',
        legend: {
          data: data.map((_, i) => `方案${i + 1}`),
          textStyle: { color: '#9aa3ad' },
          bottom: 0,
        },
        tooltip: {},
        radar: {
          indicator,
          axisName: { color: '#e6e8eb', fontSize: 10 },
          splitLine: { lineStyle: { color: '#2f3540' } },
          splitArea: { areaStyle: { color: ['#1a1d24', '#22262f'] } },
          axisLine: { lineStyle: { color: '#2f3540' } },
        },
        series: [{ type: 'radar', data: seriesData }],
      },
      true,
    )
  }, [data])

  return <div ref={elRef} style={{ height: 300, width: '100%' }} />
}

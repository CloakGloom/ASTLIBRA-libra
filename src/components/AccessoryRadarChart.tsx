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
    // 雷达图只展示非负能力值（负值视为无正贡献），坐标上限按绝对值自适应
    const maxOf = (k: AccessoryCategory) => Math.max(10, ...data.map((d) => Math.abs(d[k])))
    const indicator = dims.map((d) => ({ name: d.name, max: Math.ceil(maxOf(d.key) * 1.15) }))
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

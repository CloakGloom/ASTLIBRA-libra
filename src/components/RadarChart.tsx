import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import { RadarStats } from '../algorithm/types'

interface Props {
  data: RadarStats[]
}

const DIMS: { key: keyof RadarStats; name: string }[] = [
  { key: 'attack', name: '攻击力' },
  { key: 'defense', name: '防御力' },
  { key: 'speed', name: '速度' },
  { key: 'duration', name: '效果时间' },
  { key: 'magic', name: '魔导力' },
  { key: 'staminaMax', name: '最大体力' },
  { key: 'focusMax', name: '最大精力' },
  { key: 'mpGain', name: '精力提升' },
]

const COLORS = ['#ff8c1a', '#2f81f7', '#46d369']

// 直接使用 echarts 原生 API，避免 echarts-for-react 在 StrictMode 下的兼容问题
export function RadarChart({ data }: Props) {
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
    const maxOf = (k: keyof RadarStats) => {
      const vals = data.map((d) => d[k])
      const m = Math.max(1, ...vals.filter(v => v > 0))
      return Math.ceil(m * 1.3)
    }
    const indicator = DIMS.map((d) => ({ name: d.name, max: maxOf(d.key) }))
    const seriesData = data.map((d, i) => ({
      value: DIMS.map((dim) => d[dim.key]),
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
          axisName: { color: '#e6e8eb', fontSize: 11 },
          splitLine: { lineStyle: { color: '#2f3540' } },
          splitArea: { areaStyle: { color: ['#1a1d24', '#22262f'] } },
          axisLine: { lineStyle: { color: '#2f3540' } },
        },
        series: [{ type: 'radar', data: seriesData }],
      },
      true,
    )
  }, [data])

  return <div ref={elRef} style={{ height: 280, width: '100%' }} />
}

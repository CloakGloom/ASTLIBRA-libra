import { Button, InputNumber, Slider, Space } from 'antd'
import { AccSchoolPreset } from '../data/accessories'
import { AccessoryCategory, AccessoryWeights, ACC_CATEGORY_LABELS, ACC_CATEGORY_ORDER, ACC_CATEGORY_TO_WEIGHT } from '../types'

interface Props {
  weights: AccessoryWeights
  slotCount: number
  schoolPresets: AccSchoolPreset[]
  onWeightChange: (w: AccessoryWeights) => void
  onSlotChange: (n: number) => void
  onRun: () => void
  running: boolean
}

// 饰品配装设置面板（槽位容量 + 流派模板 + 属性权重滑块）
export function AccessoryConfig({ weights, slotCount, schoolPresets, onWeightChange, onSlotChange, onRun, running }: Props) {
  return (
    <div className="panel-card">
      <div className="panel-title">饰品配装设置</div>

      {/* 流派一键模板 */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}>流派一键模板</div>
        <Space wrap>
          {schoolPresets.map((s) => (
            <Button key={s.key} size="small" onClick={() => onWeightChange(s.weights)}>
              {s.name}
            </Button>
          ))}
        </Space>
      </div>

      {/* 饰品栏容量（可配置，默认 6，范围 1~8） */}
      <div className="slot-row" style={{ marginBottom: 10 }}>
        <span>饰品栏容量</span>
        <InputNumber min={1} max={8} value={slotCount} onChange={(v) => onSlotChange(v ?? 1)} />
        <span className="total-badge">共 {slotCount} 件</span>
      </div>

      {/* 属性权重滑块 */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}>
          属性权重（0~10，默认 5）
        </div>
        {ACC_CATEGORY_ORDER.map((c) => {
          const wk = ACC_CATEGORY_TO_WEIGHT[c]
          return (
            <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 72, fontSize: 12 }}>{ACC_CATEGORY_LABELS[c]}</span>
              <Slider
                min={0}
                max={10}
                value={weights[wk]}
                onChange={(v) => onWeightChange({ ...weights, [wk]: v })}
                style={{ flex: 1 }}
              />
              <span style={{ width: 24, textAlign: 'right' }}>{weights[wk]}</span>
            </div>
          )
        })}
      </div>

      <Button type="primary" className="big-btn" block onClick={onRun} loading={running}>
        {running ? '配装计算中…' : '开始配装'}
      </Button>
    </div>
  )
}

import { Button, Slider, Space } from 'antd'
import { SCHOOL_PRESETS } from '../data/presets'
import { UserPreferences, Weights } from '../types'

interface Props {
  prefs: UserPreferences
  onApplySchool: (w: Weights) => void
  onWeightChange: (w: Weights) => void
  onRun: () => void
  running: boolean
}

// 分组的滑块配置（20 维）
const SLIDER_GROUPS: { label: string; items: { key: keyof Weights; label: string }[] }[] = [
  {
    label: '战斗',
    items: [
      { key: 'attack', label: '攻击力' },
      { key: 'defense', label: '防御力' },
      { key: 'speed', label: '使用速度' },
      { key: 'duration', label: '效果时间' },
      { key: 'magic', label: '魔导力' },
    ],
  },
  {
    label: '生存',
    items: [
      { key: 'staminaMax', label: '最大体力' },
      { key: 'focusMax', label: '最大精力' },
      { key: 'mpGain', label: '精力提升' },
      { key: 'hpRegen', label: '体力回复' },
      { key: 'slowRegen', label: '缓慢回复' },
    ],
  },
  {
    label: '防御',
    items: [
      { key: 'blockDura', label: '格挡耐久' },
      { key: 'weightReduce', label: '减重' },
      { key: 'adapt', label: '适应力' },
    ],
  },
  {
    label: '获取',
    items: [
      { key: 'expGain', label: '经验获取' },
      { key: 'goldGain', label: '金钱获取' },
    ],
  },
  {
    label: '抗性',
    items: [
      { key: 'bldRes', label: '出血抗性' },
      { key: 'paraRes', label: '麻痹抗性' },
      { key: 'stoneRes', label: '石化抗性' },
      { key: 'blindRes', label: '失明抗性' },
      { key: 'psnRes', label: '猛毒抗性' },
    ],
  },
]

export function PreferencePanel({
  prefs,
  onApplySchool,
  onWeightChange,
  onRun,
  running,
}: Props) {
  return (
    <div className="panel-card">
      <div className="panel-title">偏好设置</div>

      {/* 流派一键模板 */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}>流派一键模板</div>
        <Space wrap>
          {SCHOOL_PRESETS.map((s) => (
            <Button key={s.key} size="small" onClick={() => onApplySchool(s.weights)}>
              {s.name}
            </Button>
          ))}
        </Space>
      </div>

      {/* 属性权重滑块（分组 + 双列布局） */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 4 }}>
          属性权重（0~10，默认 5）
        </div>
        {SLIDER_GROUPS.map((g) => (
          <div key={g.label} style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: 'var(--accent)', marginBottom: 2 }}>{g.label}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
              {g.items.map((s) => (
                <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 52, fontSize: 10, color: 'var(--text-dim)' }}>{s.label}</span>
                  <Slider
                    min={0}
                    max={10}
                    value={prefs.weights[s.key]}
                    onChange={(v) => onWeightChange({ ...prefs.weights, [s.key]: v })}
                    style={{ flex: 1, margin: 0 }}
                    tooltip={{ formatter: (v) => v }}
                  />
                  <span style={{ width: 16, textAlign: 'right', fontSize: 11 }}>{prefs.weights[s.key]}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button type="primary" className="big-btn" block onClick={onRun} loading={running}>
        {running ? '配平计算中…' : '开始配平'}
      </Button>
    </div>
  )
}

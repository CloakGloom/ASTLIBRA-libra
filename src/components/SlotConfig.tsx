import { Button, InputNumber, Space, Tag } from 'antd'
import { CHAPTER_PRESETS } from '../data/presets'
import { UserPreferences } from '../types'

interface Props {
  prefs: UserPreferences
  onChange: (next: UserPreferences) => void
}

// 天平槽位容量动态控制（偏好面板最顶部显眼位置）
export function SlotConfig({ prefs, onChange }: Props) {
  const setSlots = (leftSlots: number, rightSlots: number) => {
    onChange({ ...prefs, leftSlots, rightSlots, totalSlots: leftSlots + rightSlots })
  }

  return (
    <div className="panel-card">
      <div className="panel-title">天平槽位容量</div>

      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 6 }}>章节预设</div>
        <Space wrap>
          {CHAPTER_PRESETS.map((c) => (
            <Button
              key={c.key}
              size="small"
              onClick={() => setSlots(c.leftSlots, c.rightSlots)}
            >
              【{c.name}】
            </Button>
          ))}
        </Space>
      </div>

      <div className="slot-row">
        <span>左盘槽位</span>
        <InputNumber
          min={1}
          max={8}
          value={prefs.leftSlots}
          onChange={(v) => setSlots(v ?? 1, prefs.rightSlots)}
        />
        <span>右盘槽位</span>
        <InputNumber
          min={1}
          max={8}
          value={prefs.rightSlots}
          onChange={(v) => setSlots(prefs.leftSlots, v ?? 1)}
        />
        <span className="total-badge">总计：{prefs.totalSlots} 个</span>
      </div>

      <div style={{ marginTop: 8 }}>
        <Tag color={prefs.totalSlots < 2 ? 'red' : 'default'}>
          {prefs.totalSlots < 2 ? '总槽位不足 2，无法运行' : '槽位配置正常'}
        </Tag>
      </div>
    </div>
  )
}

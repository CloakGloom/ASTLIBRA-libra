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
    // 槽位变化时同步收敛高级天平数量，避免超出新槽位数
    const hsl = Math.min(prefs.highScalesLeft ?? 0, leftSlots)
    const hsr = Math.min(prefs.highScalesRight ?? 0, rightSlots)
    onChange({ ...prefs, leftSlots, rightSlots, totalSlots: leftSlots + rightSlots, highScalesLeft: hsl, highScalesRight: hsr })
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

      <div className="slot-row" style={{ marginTop: 10 }}>
        <span>左盘高级天平</span>
        <InputNumber
          min={0}
          max={prefs.leftSlots}
          value={prefs.highScalesLeft ?? 0}
          onChange={(v) => onChange({ ...prefs, highScalesLeft: Math.min(v ?? 0, prefs.leftSlots) })}
        />
        <span>右盘高级天平</span>
        <InputNumber
          min={0}
          max={prefs.rightSlots}
          value={prefs.highScalesRight ?? 0}
          onChange={(v) => onChange({ ...prefs, highScalesRight: Math.min(v ?? 0, prefs.rightSlots) })}
        />
      </div>
      <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-dim)' }}>
        高级天平上的白条（最低品质）会升级为青条（最高品质），数值不变；其它品质不受影响。
      </div>

      <div style={{ marginTop: 8 }}>
        <Tag color={prefs.totalSlots < 2 ? 'red' : 'default'}>
          {prefs.totalSlots < 2 ? '总槽位不足 2，无法运行' : '槽位配置正常'}
        </Tag>
      </div>
    </div>
  )
}

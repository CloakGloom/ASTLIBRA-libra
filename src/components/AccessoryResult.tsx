import { Dropdown, Empty, Space, Tag } from 'antd'
import { Accessory, AccessoryCategory, ACC_CATEGORY_LABELS, ACC_CATEGORY_ORDER } from '../types'
import { AccessoryResult as ARes } from '../algorithm/accessoryTypes'
import { AccessoryRadarChart } from './AccessoryRadarChart'

interface Props {
  results: ARes[] | null
  allItems: Accessory[]
  onReplace: (oldId: string, newId: string) => void
}

function AccChip({
  it,
  allItems,
  onReplace,
}: {
  it: Accessory
  allItems: Accessory[]
  onReplace: Props['onReplace']
}) {
  const menu = {
    items: allItems
      .filter((x) => x.id !== it.id)
      .map((x) => ({ key: x.id, label: x.name })),
    onClick: ({ key }: { key: string }) => onReplace(it.id, key),
  }
  return (
    <Dropdown menu={menu} trigger={['click']}>
      <span className="acc-chip">
        {it.name}
        {it.special ? (
          <span className="acc-special" title={it.special}>
            ★
          </span>
        ) : null}
      </span>
    </Dropdown>
  )
}

// 饰品配装结果页（Top 3 差异化方案 + 雷达图 + 维度对比高亮）
export function AccessoryResult({ results, allItems, onReplace }: Props) {
  if (!results || results.length === 0) {
    return (
      <div className="panel-card" style={{ minHeight: 300 }}>
        <div className="panel-title">配装方案</div>
        <Empty description="配置好偏好后点击「开始配装」生成配装方案" />
      </div>
    )
  }

  return (
    <div className="panel-card">
      <div className="panel-title">配装方案</div>
      {results.map((r, i) => {
        const other = results[i + 1]
        return (
          <div className="result-card" key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ color: 'var(--accent)' }}>方案 {i + 1}</strong>
              <Space>
                <Tag color="green">适应度 {r.fitness.toFixed(1)}</Tag>
                <Tag color="blue">偏好分 {r.preferenceScore.toFixed(0)}</Tag>
              </Space>
            </div>

            <div style={{ marginTop: 8 }}>
              <div className="tray">
                <div className="tray-label">饰品栏（{r.items.length} 件）</div>
                {r.items.map((it) => (
                  <AccChip key={it.id} it={it} allItems={allItems} onReplace={onReplace} />
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <div style={{ flex: 1 }}>
                <AccessoryRadarChart data={[r.net]} />
              </div>
              <div style={{ flex: 1, fontSize: 12, paddingTop: 8 }}>
                {ACC_CATEGORY_ORDER.map((c: AccessoryCategory) => {
                  const higher = other ? r.net[c] > other.net[c] : false
                  return (
                    <div key={c} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-dim)' }}>{ACC_CATEGORY_LABELS[c]}</span>
                      <span className={higher ? 'higher' : ''}>{r.net[c]}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })}
      <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 6 }}>
        提示：点击饰品可「替换为」其他饰品，算法将基于新的锁定立即重新计算。★ 表示该饰品含特殊效果。
      </div>
    </div>
  )
}

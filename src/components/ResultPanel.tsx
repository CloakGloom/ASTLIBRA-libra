import { useState } from 'react'
import { Button, Dropdown, Empty, Space, Table, Tag, Tooltip } from 'antd'
import { ComboResult, ActiveEffectInfo } from '../algorithm/types'
import { Category, CATEGORY_LABELS, Item } from '../types'
import { RadarChart } from './RadarChart'

interface Props {
  results: ComboResult[] | null
  allItems: Item[]
  onReplace: (oldItemId: string, side: 'left' | 'right', newItemId: string) => void
}

type ViewKey = 'best' | 'balancedNoDup' | 'balancedDup' | 'looseNoDup'

const VIEWS: { key: ViewKey; label: string; desc: string }[] = [
  { key: 'best', label: '最优解', desc: '三策略中适应度最高' },
  { key: 'balancedNoDup', label: '配平不重复', desc: '效率≥95% + 零重复' },
  { key: 'balancedDup', label: '配平可重复', desc: '效率≥95%' },
  { key: 'looseNoDup', label: '非配平不重复', desc: '重量差≤3 + 零重复' },
]

function ItemChip({ it, side, allItems, onReplace }: { it: Item; side: 'left' | 'right'; allItems: Item[]; onReplace: Props['onReplace'] }) {
  const menu = {
    items: allItems.filter(x => x.id !== it.id).map(x => ({ key: x.id, label: `${x.name}（${x.weight}业）` })),
    onClick: ({ key }: { key: string }) => onReplace(it.id, side, key),
  }
  return (
    <Dropdown menu={menu} trigger={['click']}>
      <span className="item-chip">
        <span style={{ fontSize: 11 }}>{it.name}</span>
        <span style={{ fontSize: 10, color: 'var(--text-dim)', marginLeft: 4 }}>({it.weight}业)</span>
      </span>
    </Dropdown>
  )
}

function buildEffectRows(left: ActiveEffectInfo[], right: ActiveEffectInfo[]) {
  const allCats = new Set([...left.map(e => e.category), ...right.map(e => e.category)])
  const rows: { catCn: string; left?: ActiveEffectInfo; right?: ActiveEffectInfo; conflict: boolean }[] = []
  for (const cat of allCats) {
    const le = left.filter(e => e.category === cat && !e.cancelled)
    const re = right.filter(e => e.category === cat && !e.cancelled)
    const conflictIds = new Set<string>()
    for (const l of le) for (const r of re) { if (l.id === r.id && l.grade === r.grade) { conflictIds.add(l.id); break } }
    le.forEach((l, i) => rows.push({ catCn: i === 0 ? CATEGORY_LABELS[cat] : '', left: l, conflict: conflictIds.has(l.id) }))
    re.forEach((r, ri) => {
      const existing = rows[rows.length - re.length + ri]
      if (existing && !existing.right) { existing.right = r; if (conflictIds.has(r.id)) existing.conflict = true }
      else rows.push({ catCn: '', right: r, conflict: conflictIds.has(r.id) })
    })
  }
  return rows
}

const EFFECT_COLS = [
  { title: '类别', dataIndex: 'catCn', width: 70, render: (v: string) => <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{v}</span> },
  {
    title: '左盘效果', width: 140,
    render: (_: any, row: any) => {
      if (!row.left) return <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>—</span>
      const e = row.left as ActiveEffectInfo
      return (
        <Tooltip title={e.duplicate ? '同侧重复(失效)' : e.cancelled ? '被右盘抵消' : `来源：${e.sourceItem}`}>
          <span style={{ fontSize: 10, color: e.cancelled ? '#666' : e.duplicate ? '#ff8c1a' : row.conflict ? '#ff4d4f' : 'var(--good)', textDecoration: e.cancelled || e.duplicate ? 'line-through' : 'none' }}>
            {e.name} <Tag color={row.conflict ? 'red' : 'orange'} style={{ margin: 0, fontSize: 9 }}>+{e.value}</Tag>
          </span>
        </Tooltip>
      )
    },
  },
  {
    title: '右盘效果', width: 140,
    render: (_: any, row: any) => {
      if (!row.right) return <span style={{ color: 'var(--text-dim)', fontSize: 10 }}>—</span>
      const e = row.right as ActiveEffectInfo
      return (
        <Tooltip title={e.duplicate ? '同侧重复(失效)' : e.cancelled ? '被左盘抵消' : `来源：${e.sourceItem}`}>
          <span style={{ fontSize: 10, color: e.cancelled ? '#666' : e.duplicate ? '#ff8c1a' : row.conflict ? '#ff4d4f' : 'var(--good)', textDecoration: e.cancelled || e.duplicate ? 'line-through' : 'none' }}>
            {e.name} <Tag color={row.conflict ? 'red' : 'orange'} style={{ margin: 0, fontSize: 9 }}>+{e.value}</Tag>
          </span>
        </Tooltip>
      )
    },
  },
]

function getResult(view: ViewKey, results: ComboResult[]): ComboResult | undefined {
  if (view === 'best') {
    return [...results].filter(Boolean).sort((a, b) => b.fitness - a.fitness)[0]
  }
  const idx = { balancedNoDup: 0, balancedDup: 1, looseNoDup: 2 }[view]
  return results[idx] ?? undefined
}

function ResultCard({ r, allItems, onReplace }: { r: ComboResult; allItems: Item[]; onReplace: Props['onReplace'] }) {
  const rows = buildEffectRows(r.leftEffects, r.rightEffects)
  return (
    <>
      <Space size={4} style={{ marginBottom: 4 }}>
        <Tag color={r.efficiency >= 95 ? 'blue' : 'orange'}>平衡度 {r.efficiency.toFixed(1)}%</Tag>
        <Tag color="green">适应度 {r.fitness.toFixed(1)}</Tag>
        {r.cancelledCount > 0 && <Tag>左右抵消 {r.cancelledCount}</Tag>}
        {r.duplicateCount > 0 && <Tag color="gold">同侧重复 {r.duplicateCount}</Tag>}
      </Space>

      <div style={{ display: 'flex', gap: 10 }}>
        <div className="tray" style={{ flex: 1 }}>
          <div className="tray-label">左盘（重 {r.leftWeight}）</div>
          {r.left.map(it => <ItemChip key={it.id} it={it} side="left" allItems={allItems} onReplace={onReplace} />)}
        </div>
        <div className="tray" style={{ flex: 1 }}>
          <div className="tray-label">右盘（重 {r.rightWeight}）</div>
          {r.right.map(it => <ItemChip key={it.id} it={it} side="right" allItems={allItems} onReplace={onReplace} />)}
        </div>
      </div>

      {rows.length > 0 && (
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 4 }}>📋 词条效果对照</div>
          <Table size="small" rowKey={(_, idx) => `${idx}`} columns={EFFECT_COLS as any} dataSource={rows} pagination={false} showHeader />
        </div>
      )}

      <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: '2px 6px', fontSize: 11 }}>
        <span style={{ color: 'var(--text-dim)', marginRight: 4 }}>总加成：</span>
        {Object.entries(r.net).filter(([, v]) => v !== 0).map(([cat, val]) => (
          <Tag key={cat} color={val > 0 ? 'orange' : 'red'} style={{ margin: 0, fontSize: 10 }}>{CATEGORY_LABELS[cat as Category]} {val > 0 ? '+' : ''}{val}</Tag>
        ))}
        {Object.entries(r.net).filter(([, v]) => v !== 0).length === 0 && <span style={{ color: 'var(--text-dim)' }}>无</span>}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <div style={{ flex: 1 }}><RadarChart data={[r.radar]} /></div>
        <div style={{ flex: 1, fontSize: 12, paddingTop: 8 }}>
          {(['attack', 'defense', 'speed', 'duration', 'magic', 'staminaMax', 'focusMax', 'mpGain'] as const).map(k => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-dim)' }}>{{ attack: '攻击力', defense: '防御力', speed: '速度', duration: '效果时间', magic: '魔导力', staminaMax: '最大体力', focusMax: '最大精力', mpGain: '精力提升' }[k]}</span>
              <span>{r.radar[k]}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export function ResultPanel({ results, allItems, onReplace }: Props) {
  const [view, setView] = useState<ViewKey>('best')

  if (!results || results.every(r => r === null)) {
    return (
      <div className="panel-card" style={{ minHeight: 300 }}>
        <div className="panel-title">天平配置</div>
        <Empty description="配置偏好后点击「开始配平」" />
      </div>
    )
  }

  const current = getResult(view, results)

  return (
    <div className="panel-card">
      <div className="panel-title" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
        <span>天平配置</span>
        <Space size={4} wrap>
          {VIEWS.map(v => (
            <Button
              key={v.key}
              size="small"
              type={view === v.key ? 'primary' : 'default'}
              onClick={() => setView(v.key)}
              title={v.desc}
            >
              {v.label}
            </Button>
          ))}
        </Space>
      </div>

      {current ? (
        <ResultCard r={current} allItems={allItems} onReplace={onReplace} />
      ) : (
        <div style={{ fontSize: 12, color: '#666', padding: 16 }}>该策略当前无可行解</div>
      )}
    </div>
  )
}

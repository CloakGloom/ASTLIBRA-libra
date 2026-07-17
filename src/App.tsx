import React, { useCallback, useEffect, useRef, useState } from 'react'
import { App as AntdApp, Button, Col, ConfigProvider, message, Row, Tabs, theme } from 'antd'
import { ComboResult, RunPayload, RunProgress, RunResult } from './algorithm/types'
import { ResultPanel } from './components/ResultPanel'
import { SlotConfig } from './components/SlotConfig'
import { PreferencePanel } from './components/PreferencePanel'
import { ItemLibrary } from './components/ItemLibrary'
import { DataIO } from './components/DataIO'
import { DebugConsole } from './components/DebugConsole'
import { AccessoryModule } from './components/AccessoryModule'
import { SaveImportButton, SaveImportResult } from './components/SaveImportButton'
import { AboutButton } from './components/AboutButton'
import { DEFAULT_WEIGHTS } from './data/presets'
import REAL_ITEMS from './data/realItems'
import { useDebounce } from './hooks/useDebounce'
import { loadPrefs, savePrefs, saveAccessories, loadItemLocks, saveItemLocks, loadSaveIds, saveSaveIds } from './utils/storage'
import { Constraints, Item, UserPreferences, Weights } from './types'

const DEFAULT_PREFS: UserPreferences = {
  weights: DEFAULT_WEIGHTS,
  leftSlots: 4,
  rightSlots: 4,
  totalSlots: 8,
}

const DEFAULT_CONSTRAINTS: Constraints = {
  forceBalance: true,  // 默认强制配平（方案1+2）
  disableRedGreen: false,
  lockEquipped: false,
}

// 错误边界：避免运行时异常导致整页黑屏，改为显示错误信息
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null }
  static getDerivedStateFromError(error: Error) {
    return { error }
  }
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info)
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, color: '#ff5b5b', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
          <h3>运行时错误（已捕获，未黑屏）</h3>
          <div>{String(this.state.error?.stack || this.state.error?.message || this.state.error)}</div>
        </div>
      )
    }
    return this.props.children
  }
}

function AppInner() {
  // 道具库始终从 REAL_ITEMS 初始化，仅通过锁定状态持久化用户修改
  const [items, setItems] = useState<Item[]>(() => {
    const locks = loadItemLocks()
    if (!locks) return REAL_ITEMS
    return REAL_ITEMS.map((it) => (locks[it.id] ? { ...it, ...locks[it.id] } : it))
  })
  const [prefs, setPrefs] = useState<UserPreferences>(() => loadPrefs() ?? DEFAULT_PREFS)
  const [constraints, setConstraints] = useState<Constraints>(DEFAULT_CONSTRAINTS)

  const [results, setResults] = useState<ComboResult[] | null>(null)
  const [running, setRunning] = useState(false)
  const [iterations, setIterations] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [bestFitness, setBestFitness] = useState(0)
  const [progress, setProgress] = useState<RunProgress | null>(null)
  const [accReloadKey, setAccReloadKey] = useState(0)
  const [saveItemIds, setSaveItemIds] = useState<Set<string>>(() => {
    const ids = loadSaveIds()
    return ids ? new Set(ids) : new Set()
  })
  const [onlySaveItems, setOnlySaveItems] = useState(true)
  const [isGaiden, setIsGaiden] = useState(() => localStorage.getItem('mode') === 'gaiden')

  const workerRef = useRef<Worker | null>(null)

  // 创建 Web Worker（算法在 Worker 中运行，防止主界面卡顿）
  useEffect(() => {
    const w = new Worker(new URL('./algorithm/worker.ts', import.meta.url), { type: 'module' })
    w.onmessage = (e: MessageEvent<{ type: string; payload: any }>) => {
      const data = e.data
      if (data.type === 'progress') {
        setProgress(data.payload as RunProgress)
      } else if (data.type === 'done') {
        const r = data.payload as RunResult
        setResults(r.results)
        setIterations(r.iterations)
        setElapsed(r.elapsed)
        setBestFitness(r.bestFitness)
        setRunning(false)
      }
    }
    w.onerror = (err) => {
      console.error('[Worker error]', err)
      setRunning(false)
      message.error('算法 Worker 运行出错，请查看控制台')
    }
    workerRef.current = w
    return () => w.terminate()
  }, [])

  // 持久化锁定状态（只保存 isLocked + lockedSide，不全量存道具列表）
  useEffect(() => {
    const locks: Record<string, { isLocked: boolean; lockedSide?: 'left' | 'right' }> = {}
    items.forEach((it) => {
      if (it.isLocked) locks[it.id] = { isLocked: it.isLocked, lockedSide: it.lockedSide }
    })
    saveItemLocks(locks)
  }, [items])
  useEffect(() => {
    saveSaveIds([...saveItemIds])
    savePrefs(prefs)
  }, [saveItemIds, prefs])

  const run = useCallback((its: Item[], pr: UserPreferences, cs: Constraints) => {
    // 防呆校验1：总槽位 < 2 禁止运行
    if (pr.totalSlots < 2) {
      message.warning('天平总槽位不足 2，无法运行（总不能空着天平吧）')
      setRunning(false)
      return
    }
    // 防呆校验2：仓库道具总数 < 左+右槽位，终止运行
    if (its.length < pr.totalSlots) {
      message.warning('当前仓库道具不足，请先去刷装备')
      setRunning(false)
      setResults(null)
      return
    }
    setResults(null)
    setRunning(true)
    setProgress(null)
    const payload: RunPayload = { items: its, preferences: pr, constraints: cs }
    workerRef.current?.postMessage({ type: 'run', payload })
  }, [])

  // 配置变更后防抖 500ms 自动重算
  const debounced = useDebounce(JSON.stringify({ items, prefs, constraints, onlySaveItems, saveItemIds: [...saveItemIds] }), 500)
  useEffect(() => {
    try {
      const parsed = JSON.parse(debounced) as {
        items: Item[]
        prefs: UserPreferences
        constraints: Constraints
        onlySaveItems: boolean
        saveItemIds: string[]
      }
      const its = parsed.onlySaveItems
        ? parsed.items.filter(it => parsed.saveItemIds.includes(it.id))
        : parsed.items
      run(its, parsed.prefs, parsed.constraints)
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  // 微调入口：替换为某道具 -> 锁定新道具到对应盘并立即重算
  const handleReplace = useCallback((_oldId: string, side: 'left' | 'right', newId: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === newId ? { ...it, isLocked: true, lockedSide: side } : it)),
    )
    setConstraints((prev) => (prev.lockEquipped ? prev : { ...prev, lockEquipped: true }))
  }, [])

  const handleImport = useCallback((data: { items?: Item[]; prefs?: UserPreferences }) => {
    if (data.items) setItems(data.items)
    if (data.prefs) setPrefs({ ...data.prefs, totalSlots: data.prefs.leftSlots + data.prefs.rightSlots })
  }, [])

  // 导入游戏存档：锁定存档中的道具 + 记录 ID + 自动配置槽位
  const handleSaveImport = useCallback((data: SaveImportResult) => {
    saveAccessories(data.accessories)
    setAccReloadKey((k) => k + 1)

    const idSet = new Set(data.items.map((it) => it.id))
    setSaveItemIds(idSet)

    setItems((prev) => {
      const updated = prev.map((it) => {
        const saved = data.items.find((s) => s.id === it.id)
        return saved ? { ...it, isLocked: saved.isLocked, lockedSide: saved.lockedSide } : it
      })
      // 追加数据库中不存在的道具（占位符）
      const existIds = new Set(updated.map(it => it.id))
      return [...updated, ...data.items.filter(it => !existIds.has(it.id))]
    })

    if (data.leftSlots > 0 || data.rightSlots > 0) {
      setPrefs((p) => ({
        ...p,
        leftSlots: data.leftSlots || p.leftSlots,
        rightSlots: data.rightSlots || p.rightSlots,
        totalSlots: (data.leftSlots || p.leftSlots) + (data.rightSlots || p.rightSlots),
      }))
      setConstraints((c) => (c.lockEquipped ? c : { ...c, lockEquipped: true }))
    }
  }, [])

  return (
    <div className="app-shell">
      <AboutButton />
      <div className="app-header">
        <div>
          <div className="app-title">⚖️ ASTLIBRA 天平配平优化器</div>
          <div className="app-subtitle">支持本篇 / 外伝 · 存档导入 · 三策略配平 · 词条对照 · 全道具数据库</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>模式</span>
          <Button
            size="small"
            type={!isGaiden ? 'primary' : 'default'}
            onClick={() => { setIsGaiden(false); localStorage.setItem('mode', 'revision') }}
          >本篇</Button>
          <Button
            size="small"
            type={isGaiden ? 'primary' : 'default'}
            onClick={() => { setIsGaiden(true); localStorage.setItem('mode', 'gaiden') }}
          >外伝</Button>
          <SaveImportButton isGaiden={isGaiden} onImport={handleSaveImport} />
          <Button onClick={() => run(items, prefs, constraints)} loading={running}>
            {running ? '计算中…' : '重新配平'}
          </Button>
        </div>
      </div>

      <Tabs
        defaultActiveKey="scale"
        items={[
          {
            key: 'scale',
            label: '⚖️ 天平配平',
            children: (
              <Row gutter={16}>
                <Col xs={24} lg={7}>
                  <SlotConfig prefs={prefs} onChange={setPrefs} />
                  <PreferencePanel
                    prefs={prefs}
                    onApplySchool={(w: Weights) => setPrefs((p) => ({ ...p, weights: w }))}
                    onWeightChange={(w: Weights) => setPrefs((p) => ({ ...p, weights: w }))}
                    onRun={() => run(items, prefs, constraints)}
                    running={running}
                  />
                </Col>

                <Col xs={24} lg={10}>
                  <ResultPanel results={results} allItems={items} onReplace={handleReplace} />
                </Col>

                <Col xs={24} lg={7}>
                  <ItemLibrary items={items} saveItemIds={saveItemIds} onlySaveItems={onlySaveItems} onOnlySaveChange={setOnlySaveItems} onChange={setItems} />
                  <DataIO exportPayload={{ items, prefs, results }} onImport={handleImport} />
                  <DebugConsole
                    running={running}
                    iterations={iterations}
                    elapsed={elapsed}
                    bestFitness={bestFitness}
                    progress={progress}
                  />
                </Col>
              </Row>
            ),
          },
          {
            key: 'acc',
            label: '💍 饰品配装',
            children: <AccessoryModule reloadKey={accReloadKey} />,
          },
        ]}
      />
    </div>
  )
}

export default function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#ff8c1a',
          colorBgBase: '#0f1115',
          borderRadius: 8,
        },
      }}
    >
      <AntdApp>
        <ErrorBoundary>
          <AppInner />
        </ErrorBoundary>
      </AntdApp>
    </ConfigProvider>
  )
}

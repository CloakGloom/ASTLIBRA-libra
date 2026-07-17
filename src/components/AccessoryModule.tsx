import { useCallback, useEffect, useRef, useState } from 'react'
import { Button, Col, Row, message } from 'antd'
import { Accessory, AccessoryPrefs, AccessoryWeights } from '../types'
import { ACC_ACCESSORIES, DEFAULT_ACCESSORY_WEIGHTS } from '../data/accessories'
import {
  AccessoryResult as ARes,
  AccessoryRunProgress,
  AccessoryRunResult,
} from '../algorithm/accessoryTypes'
import { AccessoryConfig } from './AccessoryConfig'
import { AccessoryResult } from './AccessoryResult'
import { AccessoryLibrary } from './AccessoryLibrary'
import { DebugConsole } from './DebugConsole'
import { DataIO } from './DataIO'
import { loadAccessories, loadAccessoryPrefs, saveAccessories, saveAccessoryPrefs } from '../utils/storage'
import { useDebounce } from '../hooks/useDebounce'

const DEFAULT_PREFS: AccessoryPrefs = { weights: DEFAULT_ACCESSORY_WEIGHTS, slotCount: 6 }

// 饰品配装模块：独立 Web Worker 运行遗传算法，避免主界面卡顿
export function AccessoryModule({ reloadKey }: { reloadKey?: number }) {
  const [accessories, setAccessories] = useState<Accessory[]>(() => loadAccessories() ?? ACC_ACCESSORIES)

  // 外部触发重载（如导入游戏存档后）
  useEffect(() => {
    if (reloadKey === undefined || reloadKey === 0) return
    setAccessories(loadAccessories() ?? ACC_ACCESSORIES)
    setPrefs(loadAccessoryPrefs() ?? DEFAULT_PREFS)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey])
  const [prefs, setPrefs] = useState<AccessoryPrefs>(() => loadAccessoryPrefs() ?? DEFAULT_PREFS)
  const [results, setResults] = useState<ARes[] | null>(null)
  const [running, setRunning] = useState(false)
  const [iterations, setIterations] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [bestFitness, setBestFitness] = useState(0)
  const [progress, setProgress] = useState<AccessoryRunProgress | null>(null)

  const workerRef = useRef<Worker | null>(null)

  useEffect(() => {
    const w = new Worker(new URL('../algorithm/accessoryWorker.ts', import.meta.url), { type: 'module' })
    w.onmessage = (e: MessageEvent<{ type: string; payload: any }>) => {
      const d = e.data
      if (d.type === 'progress') {
        setProgress(d.payload as AccessoryRunProgress)
      } else if (d.type === 'done') {
        const r = d.payload as AccessoryRunResult
        setResults(r.results)
        setIterations(r.iterations)
        setElapsed(r.elapsed)
        setBestFitness(r.bestFitness)
        setRunning(false)
      }
    }
    w.onerror = (err) => {
      console.error('[Accessory Worker error]', err)
      setRunning(false)
      message.error('饰品算法 Worker 运行出错，请查看控制台')
    }
    workerRef.current = w
    return () => w.terminate()
  }, [])

  useEffect(() => saveAccessories(accessories), [accessories])
  useEffect(() => saveAccessoryPrefs(prefs), [prefs])

  const run = useCallback((accs: Accessory[], pr: AccessoryPrefs) => {
    if (accs.length < pr.slotCount) {
      message.warning('当前饰品仓库不足，请先获取更多饰品')
      setRunning(false)
      setResults(null)
      return
    }
    setResults(null)
    setRunning(true)
    setProgress(null)
    workerRef.current?.postMessage({
      type: 'run',
      payload: { accessories: accs, weights: pr.weights, slotCount: pr.slotCount },
    })
  }, [])

  // 配置变更后防抖 500ms 自动重算（序列化字符串防抖，避免结果回写触发死循环）
  const debounced = useDebounce(JSON.stringify({ accessories, prefs }), 500)
  useEffect(() => {
    try {
      const p = JSON.parse(debounced) as { accessories: Accessory[]; prefs: AccessoryPrefs }
      run(p.accessories, p.prefs)
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  // 微调入口：替换为某饰品 -> 解锁旧饰品、锁定新饰品并立即重算
  const handleReplace = useCallback((oldId: string, newId: string) => {
    setAccessories((prev) =>
      prev.map((a) =>
        a.id === newId
          ? { ...a, isLocked: true }
          : a.id === oldId
            ? { ...a, isLocked: false }
            : a,
      ),
    )
  }, [])

  const handleImport = useCallback((data: { accessories?: Accessory[]; prefs?: AccessoryPrefs }) => {
    if (data.accessories) setAccessories(data.accessories)
    if (data.prefs) setPrefs(data.prefs)
  }, [])

  return (
    <Row gutter={16}>
      <Col xs={24} lg={7}>
        <AccessoryConfig
          weights={prefs.weights}
          slotCount={prefs.slotCount}
          onWeightChange={(w: AccessoryWeights) => setPrefs((p) => ({ ...p, weights: w }))}
          onSlotChange={(n) => setPrefs((p) => ({ ...p, slotCount: n }))}
          onRun={() => run(accessories, prefs)}
          running={running}
        />
      </Col>

      <Col xs={24} lg={10}>
        <AccessoryResult results={results} allItems={accessories} onReplace={handleReplace} />
      </Col>

      <Col xs={24} lg={7}>
        <AccessoryLibrary accessories={accessories} onChange={setAccessories} />
        <DataIO exportPayload={{ accessories, prefs, results }} onImport={handleImport} />
        <DebugConsole
          running={running}
          iterations={iterations}
          elapsed={elapsed}
          bestFitness={bestFitness}
          progress={progress}
        />
      </Col>
    </Row>
  )
}

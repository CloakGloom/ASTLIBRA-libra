import { Accessory, AccessoryCategory, AccessoryWeights, ACC_CATEGORY_TO_WEIGHT } from '../types'
import { AccessoryResult, AccessoryRunProgress } from './accessoryTypes'
import { shuffle } from 'lodash'

function weightOf(cat: AccessoryCategory, w: AccessoryWeights): number {
  return w[ACC_CATEGORY_TO_WEIGHT[cat]]
}

// 给单件饰品按偏好打分（用于阶段1候选池过滤）
export function scoreAccessory(a: Accessory, w: AccessoryWeights): number {
  let s = 0
  for (const e of a.effects) s += e.value * weightOf(e.category, w)
  return s
}

// ===== 阶段1：候选池过滤（保留分数最高的前 N 件） =====
function filterCandidates(accs: Accessory[], w: AccessoryWeights, poolSize = 45): Accessory[] {
  const scored = accs.map((a) => ({ a, s: scoreAccessory(a, w) }))
  scored.sort((x, y) => y.s - x.s)
  let top = scored.slice(0, poolSize).map((x) => x.a)
  // 锁定饰品必须始终进入候选池
  for (const l of accs.filter((a) => a.isLocked)) {
    if (!top.includes(l)) top.push(l)
  }
  return top
}

function netOf(items: Accessory[]): Record<AccessoryCategory, number> {
  const net = {} as Record<AccessoryCategory, number>
  for (const c of Object.keys(ACC_CATEGORY_TO_WEIGHT) as AccessoryCategory[]) net[c] = 0
  for (const it of items) for (const e of it.effects) net[e.category] += e.value
  return net
}

// 适应度评估：饰品无左右天平，直接为各维度净加成 × 权重之和；负值自然扣分
function evaluate(items: Accessory[], w: AccessoryWeights): AccessoryResult {
  const net = netOf(items)
  let preferenceScore = 0
  for (const c of Object.keys(net) as AccessoryCategory[]) preferenceScore += net[c] * weightOf(c, w)
  return { items, net, preferenceScore, fitness: preferenceScore }
}

const POP_SIZE = 120
const GENERATIONS = 200

// ===== 阶段3：启发式搜索（遗传算法 GA），无暴力穷举 =====
export function findBestAccessoryCombo(
  accs: Accessory[],
  weights: AccessoryWeights,
  slotCount: number,
  onProgress?: (p: AccessoryRunProgress) => void,
): { results: AccessoryResult[]; iterations: number; elapsed: number; bestFitness: number } {
  const t0 = Date.now()

  // 防呆：饰品总数 < 槽位容量，直接终止
  if (accs.length < slotCount) return { results: [], iterations: 0, elapsed: Date.now() - t0, bestFitness: 0 }

  const pool = filterCandidates(accs, weights)
  const N = pool.length

  // 锁定饰品（强制装备）
  const locked = accs.filter((a) => a.isLocked)
  if (locked.length > slotCount) return { results: [], iterations: 0, elapsed: Date.now() - t0, bestFitness: 0 }
  const lockedIdx = locked.map((a) => pool.indexOf(a)).filter((i) => i >= 0)
  const freeIdx = pool.map((_, i) => i).filter((i) => !lockedIdx.includes(i))
  const need = slotCount - lockedIdx.length
  if (N < slotCount || freeIdx.length < need) {
    return { results: [], iterations: 0, elapsed: Date.now() - t0, bestFitness: 0 }
  }

  // 修复：保证下标互不相同且数量正好为 slotCount（锁定项始终在内）
  const repair = (arr: number[]): number[] => {
    const used = new Set<number>(lockedIdx)
    return arr.map((idx) => {
      if (!used.has(idx)) {
        used.add(idx)
        return idx
      }
      const cand = freeIdx.find((i) => !used.has(i))
      const v = cand === undefined ? pool.findIndex((_, i) => !used.has(i)) : cand
      used.add(v)
      return v
    })
  }

  const makeInd = (): number[] => {
    const sh = shuffle([...freeIdx])
    return [...lockedIdx, ...sh.slice(0, need)]
  }

  const evalInd = (ind: number[]): AccessoryResult => evaluate(ind.map((i) => pool[i]), weights)

  const tournament = (scored: { f: number; ind: number[] }[]): number[] => {
    let best = scored[Math.floor(Math.random() * scored.length)]
    for (let i = 0; i < 3; i++) {
      const c = scored[Math.floor(Math.random() * scored.length)]
      if (c.f > best.f) best = c
    }
    return best.ind
  }

  const crossover = (a: number[], b: number[]): number[] => {
    const child = a.map((v, i) => (Math.random() < 0.5 ? v : b[i]))
    return repair(child)
  }

  const mutate = (ind: number[]) => {
    if (Math.random() < 0.4) {
      const pos = Math.floor(Math.random() * ind.length)
      const unused = freeIdx.find((i) => !ind.includes(i))
      if (unused !== undefined) ind[pos] = unused
    }
  }

  let population: number[][] = Array.from({ length: POP_SIZE }, () => makeInd())
  let globalBest: AccessoryResult | null = null
  let iterations = 0

  for (let g = 0; g < GENERATIONS; g++) {
    const scored = population.map((ind) => {
      const r = evalInd(ind)
      return { ind, res: r, f: r.fitness }
    })
    scored.sort((a, b) => b.f - a.f)
    const top = scored[0].res
    if (!globalBest || top.fitness > globalBest.fitness) globalBest = top

    const next: number[][] = [scored[0].ind] // 精英保留
    while (next.length < POP_SIZE) {
      const child = crossover(tournament(scored), tournament(scored))
      mutate(child)
      next.push(child)
    }
    population = next
    iterations = g + 1
    if (onProgress && g % 20 === 0) onProgress({ iteration: g + 1, elapsed: Date.now() - t0 })
  }

  // 最终种群评估 + 挑选最佳方案
  const finals = population.map((ind) => evalInd(ind)).sort((a, b) => b.fitness - a.fitness)

  const best = finals[0]
  if (globalBest && (!best || globalBest.fitness > best.fitness)) {
    return {
      results: [globalBest],
      iterations,
      elapsed: Date.now() - t0,
      bestFitness: globalBest.fitness,
    }
  }

  return {
    results: best ? [best] : [],
    iterations,
    elapsed: Date.now() - t0,
    bestFitness: best?.fitness ?? 0,
  }
}

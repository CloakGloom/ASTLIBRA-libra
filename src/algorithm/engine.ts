import { Category, Constraints, Effect, Grade, Item, UserPreferences, Weights } from '../types'
import { ActiveEffectInfo, ComboResult, RadarStats, RunProgress } from './types'

const CAT_TO_W: Record<Category, keyof Weights> = {
  ATK:'attack',DEF:'defense',SPD:'speed',DURATION:'duration',MAG:'magic',
  STA_MAX:'staminaMax',FOC_MAX:'focusMax',MP_GAIN:'mpGain',HP_RGN:'hpRegen',
  SLOW_RGN:'slowRegen',BLK_DUR:'blockDura',WGT_RED:'weightReduce',
  EXP_GAIN:'expGain',GOLD_GAIN:'goldGain',BLD_RES:'bldRes',PARA_RES:'paraRes',
  STONE_RES:'stoneRes',BLIND_RES:'blindRes',PSN_RES:'psnRes',ADP:'adapt',
}
const wgt = (c: Category, w: Weights) => w[CAT_TO_W[c]]
const disabled = (g: Grade, c: Constraints) => c.disableRedGreen && (g===Grade.Red||g===Grade.Green)

export function scoreItem(item: Item, weights: Weights, constraints: Constraints): number {
  let s = 0; for (const e of item.effects) if (!disabled(e.grade, constraints)) s += e.value * wgt(e.category, weights)
  return s
}

// ---- 冲突规则 ----
interface WorkEffect extends Effect { cancelled?: boolean; duplicate?: boolean; effective: number; sourceName: string; sourceLocked: boolean }

function applyRules(leftItems: Item[], rightItems: Item[], constraints: Constraints) {
  const act = (item: Item): WorkEffect[] => item.effects.filter(e => !disabled(e.grade, constraints))
    .map(e => ({ ...e, effective: e.value, sourceName: item.name, sourceLocked: !!item.isLocked }))
  let left = leftItems.flatMap(act), right = rightItems.flatMap(act)
  const usedR = new Set<number>()
  for (const le of left) { const idx = right.findIndex((re, i) => !usedR.has(i) && re.id === le.id && re.grade === le.grade); if (idx >= 0) { usedR.add(idx); le.cancelled = true; right[idx].cancelled = true } }
  const keepMax = (side: WorkEffect[]) => {
    const g = new Map<string, WorkEffect[]>(); for (const e of side) { if (e.cancelled) continue; const k = `${e.category}_${e.grade}`; if (!g.has(k)) g.set(k, []); g.get(k)!.push(e) }
    for (const arr of g.values()) { if (arr.length <= 1) continue; let max = arr[0]; for (const e of arr) if (e.value > max.value) max = e; for (const e of arr) if (e !== max) { e.effective = 0; e.duplicate = true } }
  }; keepMax(left); keepMax(right); return { left, right }
}
function toInfo(eff: WorkEffect): ActiveEffectInfo {
  return { id: eff.id, name: eff.name, grade: eff.grade, value: eff.value, category: eff.category, sourceItem: eff.sourceName, sourceLocked: eff.sourceLocked, cancelled: !!eff.cancelled, duplicate: !!eff.duplicate }
}
function computeAll(leftItems: Item[], rightItems: Item[], constraints: Constraints) {
  const { left, right } = applyRules(leftItems, rightItems, constraints)
  const net: Record<Category, number> = { ATK:0,DEF:0,SPD:0,DURATION:0,MAG:0,STA_MAX:0,FOC_MAX:0,MP_GAIN:0,HP_RGN:0,SLOW_RGN:0,BLK_DUR:0,WGT_RED:0,EXP_GAIN:0,GOLD_GAIN:0,BLD_RES:0,PARA_RES:0,STONE_RES:0,BLIND_RES:0,PSN_RES:0,ADP:0 }
  let cc = 0, dc = 0
  for (const e of left) { if (e.cancelled) cc++; else net[e.category] += e.effective; if (e.duplicate) dc++ }
  for (const e of right) { if (e.cancelled) cc++; else net[e.category] += e.effective; if (e.duplicate) dc++ }
  const lw = leftItems.reduce((s,it)=>s+it.weight,0), rw = rightItems.reduce((s,it)=>s+it.weight,0), tw = lw + rw
  return { left: left.map(toInfo), right: right.map(toInfo), net, cc, dc, lw, rw, eff: tw===0?100:(1-Math.abs(lw-rw)/tw)*100 }
}

// ---- 两两组合 ----
interface Pair { idxA: number; idxB: number; sum: number }

function genPairs(items: Item[]): Pair[] {
  const pairs: Pair[] = []
  for (let i = 0; i < items.length; i++)
    for (let j = i + 1; j < items.length; j++)
      pairs.push({ idxA: i, idxB: j, sum: items[i].weight + items[j].weight })
  return pairs
}

// 从 pool 中选 k 个道具的 sum 对应的所有组合（k=1,2,3,4）
function combosForK(
  pool: Item[], k: number, sum: number,
  pairsBySum: Map<number, Pair[]>,
  singlesBySum: Map<number, number[]>,
): number[][] {
  const result: number[][] = []
  const limit = 200
  if (k === 0) { if (sum === 0) result.push([]); return result }
  if (k === 1) { for (const idx of singlesBySum.get(sum) || []) { result.push([idx]); if (result.length >= limit) break }; return result }
  if (k === 2) { for (const p of pairsBySum.get(sum) || []) { result.push([p.idxA, p.idxB]); if (result.length >= limit) break }; return result }
  if (k === 3) {
    const seen = new Set<string>()
    for (let i = 0; i < pool.length; i++) {
      const need = sum - pool[i].weight
      for (const p of pairsBySum.get(need) || []) {
        if (p.idxA === i || p.idxB === i) continue
        const key = [i, p.idxA, p.idxB].sort().join(',')
        if (seen.has(key)) continue; seen.add(key)
        result.push([i, p.idxA, p.idxB])
        if (result.length >= limit) return result
      }
    }
    return result
  }
  if (k === 4) {
    const seen = new Set<string>()
    for (const [s1, p1List] of pairsBySum) {
      const s2 = sum - s1; if (s2 < s1) continue
      const p2List = pairsBySum.get(s2); if (!p2List) continue
      for (const p1 of p1List) {
        for (const p2 of p2List) {
          if (p1.idxA === p2.idxA || p1.idxA === p2.idxB || p1.idxB === p2.idxA || p1.idxB === p2.idxB) continue
          if (s1 === s2 && p1.idxA > p2.idxA) continue
          const key = [p1.idxA, p1.idxB, p2.idxA, p2.idxB].sort().join(',')
          if (seen.has(key)) continue; seen.add(key)
          result.push([p1.idxA, p1.idxB, p2.idxA, p2.idxB])
          if (result.length >= limit) return result
        }
      }
    }
    return result
  }
  return result
}

function buildResult(
  leftIdx: number[], rightIdx: number[], freeItems: Item[],
  lockL: Item[], lockR: Item[], constraints: Constraints, prefs: UserPreferences,
  leftSlots: number, rightSlots: number,
): ComboResult | null {
  const lItems = [...lockL, ...leftIdx.map(i => freeItems[i])]
  const rItems = [...lockR, ...rightIdx.map(i => freeItems[i])]
  if (lItems.length !== leftSlots || rItems.length !== rightSlots) return null
  const { net, cc, dc, lw, rw, eff, left, right } = computeAll(lItems, rItems, constraints)
  let pf = 0; for (const cat of Object.keys(net) as Category[]) pf += net[cat] * wgt(cat, prefs.weights)
  const fit = pf + (lw + rw) * 0.5
  const radar: RadarStats = { attack:net.ATK, defense:net.DEF, speed:net.SPD, duration:net.DURATION, magic:net.MAG, staminaMax:net.STA_MAX, focusMax:net.FOC_MAX, mpGain:net.MP_GAIN }
  const { left: le, right: re } = applyRules(lItems, rItems, constraints)
  return { left: lItems, right: rItems, net, radar, efficiency: eff, preferenceScore: pf, fitness: fit, cancelledCount: cc, duplicateCount: dc, leftWeight: lw, rightWeight: rw, leftEffects: le.map(toInfo), rightEffects: re.map(toInfo) }
}

// ---- 主入口 ----
export function findBestCombination(
  items: Item[], prefs: UserPreferences, constraints: Constraints,
  onProgress?: (p: RunProgress) => void,
) {
  const t0 = Date.now()
  const lockL = constraints.lockEquipped ? items.filter(it => it.isLocked && it.lockedSide === 'left') : []
  const lockR = constraints.lockEquipped ? items.filter(it => it.isLocked && it.lockedSide === 'right') : []
  const freeL = Math.max(0, prefs.leftSlots - lockL.length)
  const freeR = Math.max(0, prefs.rightSlots - lockR.length)
  const freeItems = items.filter(it => !it.isLocked)
  const lockSumL = lockL.reduce((s,it)=>s+it.weight,0)
  const lockSumR = lockR.reduce((s,it)=>s+it.weight,0)

  if (freeL < 0 || freeR < 0 || freeItems.length < freeL + freeR) {
    return { results: [], iterations: 0, elapsed: Date.now()-t0, bestFitness: 0 }
  }

  if (onProgress) onProgress({ iteration: 0, elapsed: Date.now()-t0 })

  // 预计算两两组合（最多2211对）
  const pairs = genPairs(freeItems)
  const pairsBySum = new Map<number, Pair[]>()
  for (const p of pairs) { if (!pairsBySum.has(p.sum)) pairsBySum.set(p.sum, []); pairsBySum.get(p.sum)!.push(p) }

  // 单体按重量分组
  const singlesBySum = new Map<number, number[]>()
  for (let i = 0; i < freeItems.length; i++) {
    const w = freeItems[i].weight
    if (!singlesBySum.has(w)) singlesBySum.set(w, [])
    singlesBySum.get(w)!.push(i)
  }

  // 左右最大可能重量
  const sortedWeights = freeItems.map(it => it.weight).sort((a,b)=>b-a)
  const maxFreeL = sortedWeights.slice(0, freeL).reduce((a,b)=>a+b,0)
  const maxFreeR = sortedWeights.slice(0, freeR).reduce((a,b)=>a+b,0)
  const maxSum = lockSumL + maxFreeL

  const results: (ComboResult | null)[] = [null, null, null]

  // ---- 方案1：配平不重复 — 配平(100%) > 总重最大 > 属性偏好 ----
  let candidates1: ComboResult[] = []
  for (let target = maxSum; target >= 0; target--) {
    if (candidates1.length > 0) break
    const lCombos = combosForK(freeItems, freeL, target - lockSumL, pairsBySum, singlesBySum)
    const rCombos = combosForK(freeItems, freeR, target - lockSumR, pairsBySum, singlesBySum)
    for (const lIdx of lCombos) {
      const lSet = new Set(lIdx)
      for (const rIdx of rCombos) {
        if (rIdx.some(i => lSet.has(i))) continue
        const r = buildResult(lIdx, rIdx, freeItems, lockL, lockR, constraints, prefs, prefs.leftSlots, prefs.rightSlots)
        if (r && r.efficiency >= 95 && r.duplicateCount === 0) candidates1.push(r)
      }
    }
    if (Date.now() - t0 > 3000) break
  }
  // 同总重内总重≈属性
  if (candidates1.length > 0) { candidates1.sort((a,b) => b.fitness - a.fitness); results[0] = candidates1[0] }

  // ---- 方案2：配平可重复 — 配平(100%) > 总重最大 ≈ 属性偏好 ----
  let candidates2: ComboResult[] = []
  for (let target = maxSum; target >= 0; target--) {
    if (candidates2.length > 0) break
    const lCombos = combosForK(freeItems, freeL, target - lockSumL, pairsBySum, singlesBySum)
    const rCombos = combosForK(freeItems, freeR, target - lockSumR, pairsBySum, singlesBySum)
    for (const lIdx of lCombos) {
      const lSet = new Set(lIdx)
      for (const rIdx of rCombos) {
        if (rIdx.some(i => lSet.has(i))) continue
        const r = buildResult(lIdx, rIdx, freeItems, lockL, lockR, constraints, prefs, prefs.leftSlots, prefs.rightSlots)
        if (r && r.efficiency >= 95) candidates2.push(r)
      }
    }
    if (Date.now() - t0 > 3000) break
  }
  if (candidates2.length > 0) {
    // 总重+偏好各半权重
    candidates2.sort((a,b) => b.fitness - a.fitness)
    results[1] = candidates2[0]
  }

  // ---- 方案3：非配平不重复 — 属性偏好 > 总重最大 ≈ 配平 ----
  // 收集所有 diff 1~3 + 无重复的组合，按偏好优先排序
  let candidates3: ComboResult[] = []
  const maxL = lockSumL + sortedWeights.slice(0, freeL).reduce((a,b)=>a+b,0)
  for (let lt = maxL; lt >= 0; lt--) {
    if (Date.now() - t0 > 4000) break
    const lCombos = combosForK(freeItems, freeL, lt - lockSumL, pairsBySum, singlesBySum)
    if (!lCombos.length) continue
    for (let offset = 1; offset <= 3; offset++) {
      for (const sign of [1, -1]) {
        const rt = lt + offset * sign; if (rt < 0) continue
        const rCombos = combosForK(freeItems, freeR, rt - lockSumR, pairsBySum, singlesBySum)
        for (const lIdx of lCombos) {
          const lSet = new Set(lIdx)
          for (const rIdx of rCombos) {
            if (rIdx.some(i => lSet.has(i))) continue
            const r = buildResult(lIdx, rIdx, freeItems, lockL, lockR, constraints, prefs, prefs.leftSlots, prefs.rightSlots)
            if (r && r.duplicateCount === 0) candidates3.push(r)
          }
        }
      }
    }
  }
  if (candidates3.length > 0) {
    // 偏好优先，总重作 tie-breaker
    candidates3.sort((a,b) => b.preferenceScore !== a.preferenceScore ? b.preferenceScore - a.preferenceScore : (b.leftWeight+b.rightWeight) - (a.leftWeight+a.rightWeight))
    results[2] = candidates3[0]
  }
  if (!results[2] && results[0]) results[2] = results[0]
  if (!results[1] && results[0]) results[1] = results[0]
  if (!results[0] && results[1]) results[0] = results[1]

  const out = results.filter(Boolean) as ComboResult[]
  return { results: out, iterations: pairs.length, elapsed: Date.now()-t0, bestFitness: out[0]?.fitness ?? 0 }
}

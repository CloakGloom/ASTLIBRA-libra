import { Category, Constraints, Item, UserPreferences } from '../types'

// 雷达图八维（核心战斗属性）
export interface RadarStats {
  attack: number
  defense: number
  speed: number
  duration: number
  magic: number
  staminaMax: number
  focusMax: number
  mpGain: number
}

// 单条已生效词条（含来源道具）
export interface ActiveEffectInfo {
  id: string
  name: string
  grade: number
  value: number
  category: Category
  sourceItem: string
  sourceLocked: boolean  // 来源道具是否被锁定
  cancelled: boolean
  duplicate: boolean
}

// 单套方案结果
export interface ComboResult {
  left: Item[]
  right: Item[]
  net: Record<Category, number>
  radar: RadarStats
  efficiency: number
  preferenceScore: number
  fitness: number
  cancelledCount: number // 左右对称抵消词条数
  duplicateCount: number  // 同侧重复词条数
  leftWeight: number
  rightWeight: number
  leftEffects: ActiveEffectInfo[]  // 左盘已生效词条列表
  rightEffects: ActiveEffectInfo[] // 右盘已生效词条列表
}

export interface RunPayload {
  items: Item[]
  preferences: UserPreferences
  constraints: Constraints
}

export interface RunProgress {
  iteration: number
  elapsed: number
}

export interface RunResult {
  results: ComboResult[]
  iterations: number
  elapsed: number
  bestFitness: number
}

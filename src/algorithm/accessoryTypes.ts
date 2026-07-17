import { AccessoryCategory, AccessoryWeights } from '../types'

// 单套饰品配装方案结果
export interface AccessoryResult {
  items: import('../types').Accessory[]
  net: Record<AccessoryCategory, number> // 各维度净加成（含负值）
  preferenceScore: number // 偏好加权得分
  fitness: number // 最终适应度（= 偏好加权得分）
}

export interface AccessoryRunPayload {
  accessories: import('../types').Accessory[]
  weights: AccessoryWeights
  slotCount: number
}

export interface AccessoryRunProgress {
  iteration: number
  elapsed: number
}

export interface AccessoryRunResult {
  results: AccessoryResult[]
  iterations: number
  elapsed: number
  bestFitness: number
}

import { Weights } from '../types'

// 流派一键模板
export interface SchoolPreset {
  key: string
  name: string
  weights: Weights
}

const _0_: Weights = {
  attack: 0, defense: 0, speed: 0, duration: 0, magic: 0,
  staminaMax: 0, focusMax: 0, mpGain: 0, hpRegen: 0,
  slowRegen: 0, blockDura: 0, weightReduce: 0,
  expGain: 0, goldGain: 0, bldRes: 0, paraRes: 0,
  stoneRes: 0, blindRes: 0, psnRes: 0, adapt: 0,
}

function w(overrides: Partial<Weights>): Weights {
  return { ..._0_, ...overrides }
}

export const SCHOOL_PRESETS: SchoolPreset[] = [
  {
    key: 'physical',
    name: '物理强攻',
    weights: w({ attack: 10, defense: 6, speed: 4, blockDura: 4 }),
  },
  {
    key: 'magic',
    name: '魔法炮台',
    weights: w({ magic: 10, mpGain: 7, focusMax: 7, duration: 5 }),
  },
  {
    key: 'tank',
    name: '坚盾壁垒',
    weights: w({ defense: 10, staminaMax: 8, hpRegen: 7, slowRegen: 5, blockDura: 6 }),
  },
  {
    key: 'agile',
    name: '极速投掷',
    weights: w({ speed: 10, weightReduce: 8, duration: 5, attack: 5 }),
  },
  {
    key: 'farm',
    name: '刷宝达人',
    weights: w({ goldGain: 10, expGain: 10, bldRes: 5, paraRes: 5, stoneRes: 5, blindRes: 5, psnRes: 5 }),
  },
]

// 章节槽位预设
export interface ChapterPreset {
  key: string
  name: string
  leftSlots: number
  rightSlots: number
}

export const CHAPTER_PRESETS: ChapterPreset[] = [
  { key: 'prologue', name: '序章', leftSlots: 3, rightSlots: 3 },
  { key: 'ch3', name: '第三章', leftSlots: 4, rightSlots: 4 },
  { key: 'ch5', name: '第五章', leftSlots: 4, rightSlots: 5 },
  { key: 'final', name: '终章', leftSlots: 5, rightSlots: 5 },
]

export const DEFAULT_WEIGHTS: Weights = w({
  attack: 5, defense: 5, speed: 5, duration: 5, magic: 5,
  staminaMax: 5, focusMax: 5, mpGain: 5, hpRegen: 5,
  slowRegen: 5, blockDura: 5, weightReduce: 5,
  expGain: 5, goldGain: 5, bldRes: 5, paraRes: 5,
  stoneRes: 5, blindRes: 5, psnRes: 5, adapt: 5,
})

// ===== 一、数据层类型定义 =====

// 1. 词条等级枚举
export enum Grade {
  White = 0,
  Yellow = 1,
  Red = 2,
  Green = 3,
}

// 词条类别（扩展为 19 维，覆盖全部真实道具效果）
export type Category =
  | 'ATK' // 攻击力
  | 'DEF' // 防御力
  | 'SPD' // 使用速度
  | 'DURATION' // 效果时间
  | 'MAG' // 魔导力
  | 'STA_MAX' // 最大体力
  | 'FOC_MAX' // 最大精力
  | 'MP_GAIN' // 精力提升量
  | 'HP_RGN' // 体力回复量
  | 'SLOW_RGN' // 缓慢回复
  | 'BLK_DUR' // 格挡耐久力
  | 'WGT_RED' // 重量减轻
  | 'EXP_GAIN' // 经验获取
  | 'GOLD_GAIN' // 金钱获取
  | 'BLD_RES' // 出血抗性
  | 'PARA_RES' // 麻痹抗性
  | 'STONE_RES' // 石化抗性
  | 'BLIND_RES' // 失明抗性
  | 'PSN_RES' // 猛毒抗性
  | 'ADP' // 适应力

// 2. 单个词条（效果）
export interface Effect {
  id: string // 唯一标识，如 "atk_up"（同一类词条共享 id 以便对称抵消判定）
  name: string // 显示名，如 "攻击力提升"
  grade: Grade // 白/黄/红/绿
  value: number // 数值（如 +15）
  category: Category
}

// 3. 天平道具
export interface Item {
  id: string
  name: string
  weight: number // 重量（影响指针平衡）
  effects: Effect[] // 该道具拥有的词条列表
  isLocked?: boolean // 是否被用户手动锁定
  lockedSide?: 'left' | 'right' // 锁定后强制放入的盘（左/右）
}

// 十九维属性权重（属性权重滑块）
export interface Weights {
  attack: number // 攻击力
  defense: number // 防御力
  speed: number // 使用速度
  duration: number // 效果时间
  magic: number // 魔导力
  staminaMax: number // 最大体力
  focusMax: number // 最大精力
  mpGain: number // 精力提升量
  hpRegen: number // 体力回复量
  slowRegen: number // 缓慢回复
  blockDura: number // 格挡耐久力
  weightReduce: number // 重量减轻
  expGain: number // 经验获取
  goldGain: number // 金钱获取
  bldRes: number // 出血抗性
  paraRes: number // 麻痹抗性
  stoneRes: number // 石化抗性
  blindRes: number // 失明抗性
  psnRes: number // 猛毒抗性
  adapt: number // 适应力
}

// 偏好设置（含天平槽位容量动态控制）
export interface UserPreferences {
  weights: Weights
  leftSlots: number // 左侧槽位数（默认4）
  rightSlots: number // 右侧槽位数（默认4）
  totalSlots: number // 只读，自动计算 leftSlots + rightSlots
}

// 硬性约束开关
export interface Constraints {
  forceBalance: boolean // 强制保留天平100%
  disableRedGreen: boolean // 禁用红色/绿色词条
  lockEquipped: boolean // 锁定已装备道具
}

export const GRADE_LABELS: Record<Grade, string> = {
  [Grade.White]: '白',
  [Grade.Yellow]: '黄',
  [Grade.Red]: '红',
  [Grade.Green]: '绿',
}

export const CATEGORY_LABELS: Record<Category, string> = {
  ATK: '攻击力',
  DEF: '防御力',
  SPD: '使用速度',
  DURATION: '效果时间',
  MAG: '魔导力',
  STA_MAX: '最大体力',
  FOC_MAX: '最大精力',
  MP_GAIN: '精力提升',
  HP_RGN: '体力回复',
  SLOW_RGN: '缓慢回复',
  BLK_DUR: '格挡耐久',
  WGT_RED: '减重',
  EXP_GAIN: '经验',
  GOLD_GAIN: '金钱',
  BLD_RES: '出血抗性',
  PARA_RES: '麻痹抗性',
  STONE_RES: '石化抗性',
  BLIND_RES: '失明抗性',
  PSN_RES: '猛毒抗性',
  ADP: '适应力',
}

// 核心战斗属性（用于雷达图展示）
export const RADAR_CATEGORIES: Category[] = [
  'ATK', 'DEF', 'SPD', 'DURATION', 'MAG',
  'STA_MAX', 'FOC_MAX', 'MP_GAIN',
]

// 辅助属性（用文字标签展示）
export const AUX_CATEGORIES: Category[] = [
  'HP_RGN', 'SLOW_RGN', 'BLK_DUR', 'WGT_RED',
  'EXP_GAIN', 'GOLD_GAIN',
  'BLD_RES', 'PARA_RES', 'STONE_RES', 'BLIND_RES', 'PSN_RES',
  'ADP',
]

// ===== 饰品（饰品栏，不占用天平格）类型 =====
// 真实游戏饰品的属性维度（比天平道具更丰富）
export type AccessoryCategory =
  | 'ATK' // 攻击力
  | 'DEF' // 防御力
  | 'SPD' // 敏捷
  | 'STA' // 最大体力
  | 'FOC' // 最大精力
  | 'MAG' // 魔导力
  | 'BLK' // 格挡
  | 'LCK' // 幸运
  | 'ADP' // 适应力
  | 'RES' // 抗性（出血/麻痹/石化/失明/猛毒 综合）

export interface AccessoryEffect {
  id: string // 语义化 id（同类词条共享，便于扩展抵消/分组）
  name: string // 显示名
  category: AccessoryCategory
  value: number // 数值（可正可负）
}

export interface Accessory {
  id: string
  name: string
  effects: AccessoryEffect[]
  special?: string // 特殊效果描述（不参与数值寻优，仅展示）
  isLocked?: boolean // 用户锁定（强制装备）
}

export interface AccessoryWeights {
  attack: number
  defense: number
  agility: number
  stamina: number
  focus: number
  magic: number
  block: number
  luck: number
  adapt: number
  resist: number
}

// 饰品偏好（含可配置的饰品栏容量）
export interface AccessoryPrefs {
  weights: AccessoryWeights
  slotCount: number // 饰品栏容量（默认 6，范围 1~8）
}

export const ACC_CATEGORY_LABELS: Record<AccessoryCategory, string> = {
  ATK: '攻击力',
  DEF: '防御力',
  SPD: '敏捷',
  STA: '最大体力',
  FOC: '最大精力',
  MAG: '魔导力',
  BLK: '格挡',
  LCK: '幸运',
  ADP: '适应力',
  RES: '抗性',
}

export const ACC_CATEGORY_ORDER: AccessoryCategory[] = [
  'ATK',
  'DEF',
  'SPD',
  'STA',
  'FOC',
  'MAG',
  'BLK',
  'LCK',
  'ADP',
  'RES',
]

// 饰品类别 -> 权重键 映射
export const ACC_CATEGORY_TO_WEIGHT: Record<AccessoryCategory, keyof AccessoryWeights> = {
  ATK: 'attack',
  DEF: 'defense',
  SPD: 'agility',
  STA: 'stamina',
  FOC: 'focus',
  MAG: 'magic',
  BLK: 'block',
  LCK: 'luck',
  ADP: 'adapt',
  RES: 'resist',
}

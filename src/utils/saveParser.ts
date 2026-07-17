import { Accessory, Effect, Category, Grade, Item } from '../types'
import { ACC_ACCESSORIES } from '../data/accessories'
import REAL_ITEMS from '../data/realItems'

// ===== SAVE_XXXX.DAT (ALBR_SAV) 及 SAVE_CONFIG.DAT 统一解析 =====

export interface ParsedSave {
  magic: string
  version: number
  leftSlots: number
  rightSlots: number
  /** 装备中的饰品编号 (1-68) */
  accessoryIds: number[]
  /** 左盘道具编号 */
  leftItemIds: number[]
  /** 右盘道具编号 */
  rightItemIds: number[]
  /** 背包中所有道具编号（去重） */
  inventoryIds: number[]
}

// ---- 解析主函数 ----
export function parseSaveFile(buffer: ArrayBuffer): ParsedSave {
  const dv = new DataView(buffer)
  const magic = String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3),
    dv.getUint8(4), dv.getUint8(5), dv.getUint8(6), dv.getUint8(7))

  if (magic === 'ALBR_SAV') {
    return parseAlbrSav(dv)
  }
  // 无 magic 的旧格式（SAVE_CONFIG.DAT）
  return parseConfigDat(dv)
}

// ---- ALBR_SAV 解析 ----
function parseAlbrSav(dv: DataView): ParsedSave {
  const version = dv.getUint32(8, true)
  // 槽位：header int32[29]=左盘 [30]=右盘
  const leftSlots = dv.getUint32(116, true)
  const rightSlots = dv.getUint32(120, true)

  // 饰品: uint16 1-68 + int32 0x01XX
  const accAll = new Set<number>()
  for (let i = 0; i < dv.byteLength - 2; i += 2) {
    const v = dv.getUint16(i, true)
    if (v >= 1 && v <= 68) accAll.add(v)
  }
  for (let i = 0; i < dv.byteLength; i += 4) {
    const v = dv.getUint32(i, true)
    if (isAccessory(v)) accAll.add(v & 0xFF)
  }

  // 道具: uint8 + uint16 + int32 三通道合并（互补覆盖）
  const itemAll = new Set<number>()
  for (let i = 0; i < dv.byteLength; i++) {
    const v = dv.getUint8(i)
    if (v >= 5 && v <= 250) itemAll.add(v)
  }
  for (let i = 0; i < dv.byteLength - 2; i += 2) {
    const v = dv.getUint16(i, true)
    if (v >= 5 && v <= 500) itemAll.add(v)
  }
  for (let i = 0; i < dv.byteLength; i += 4) {
    const v = dv.getUint32(i, true)
    if (v >= 5 && v <= 500 && (v >>> 8) !== 1) itemAll.add(v)
  }

  return {
    magic: 'ALBR_SAV',
    version,
    leftSlots: Math.min(leftSlots, 5),
    rightSlots: Math.min(rightSlots, 5),
    accessoryIds: [...accAll],
    leftItemIds: [],
    rightItemIds: [],
    inventoryIds: [...itemAll],
  }
}

// ---- 旧 SAVE_CONFIG.DAT 解析 ----
function parseConfigDat(dv: DataView): ParsedSave {
  const ints: number[] = []
  for (let i = 0; i < dv.byteLength; i += 4) ints.push(dv.getUint32(i, true))

  const accSet: number[] = []
  const itemSets: number[][] = []
  let pos = 3 // 跳过文件头 [w, h, ver]

  while (pos < ints.length) {
    while (pos < ints.length && ints[pos] === 0) pos++
    if (pos >= ints.length) break

    const v = ints[pos]
    if (isAccessory(v)) {
      const set: number[] = []
      while (pos < ints.length && isAccessory(ints[pos])) set.push(ints[pos++] & 0xFF)
      accSet.push(...set)
    } else if (isValidItem(v)) {
      const set: number[] = []
      while (pos < ints.length && isValidItem(ints[pos])) set.push(ints[pos++])
      if (set.length >= 3) itemSets.push(set)
      else pos++ // 跳过配置误识别
    } else {
      pos++
    }
  }

  // 取最大的两组道具作为左右盘
  const sorted = [...itemSets].sort((a, b) => b.length - a.length)
  const leftIds = sorted[0] ?? []
  const rightIds = sorted[1] ?? []

  return {
    magic: 'CONFIG',
    version: ints[2] ?? 0,
    leftSlots: Math.min(leftIds.length, 5),
    rightSlots: Math.min(rightIds.length, 5),
    accessoryIds: [...new Set(accSet)].filter(id => id >= 1 && id <= 68),
    leftItemIds: leftIds.slice(0, 5),
    rightItemIds: rightIds.slice(0, 5),
    inventoryIds: [...new Set([...leftIds, ...rightIds])],
  }
}

// ---- ID 辅助函数 ----
function isAccessory(v: number): boolean {
  return (v >>> 8) === 0x01 && (v & 0xFF) >= 1 && (v & 0xFF) <= 68
}

function isValidItem(v: number): boolean {
  return v >= 5 && v <= 1000 && !isAccessory(v)
}

// ---- 映射到 App 内部数据 ----
export function findAccessoryById(num: number): Accessory | undefined {
  const id = `acc_${String(num).padStart(2, '0')}`
  return ACC_ACCESSORIES.find(a => a.id === id)
}

export function findItemById(num: number, isGaiden = false): Item {
  const padded = String(num).padStart(3, '0')
  // 尝试多种 ID 格式
  for (const prefix of ['i', 'i_']) {
    for (const sfx of [padded, `${num}`, `${num}b`, `${num}a`, `r${num}`, `rev_${num}`]) {
      const exact = REAL_ITEMS.find(it => it.id === `${prefix}${sfx}`)
      if (exact) return exact
    }
  }
  // 模糊匹配
  const partial = REAL_ITEMS.find(it => it.id.includes(`_${num}`) || it.id.endsWith(String(num)) || it.id.endsWith(`${num}b`))
  if (partial) return partial
  // 占位
  return { id: `i${padded}`, name: `? #${num}`, weight: 0, effects: [] }
}

// ---- 提取配装 ----
export interface SaveLoadout {
  accessories: Accessory[]
  allItems: Item[]
  leftSlots: number
  rightSlots: number
  parsed: ParsedSave
}

export function extractLoadout(parsed: ParsedSave, isGaiden = false): SaveLoadout {
  // 饰品
  const accMap = new Map<number, Accessory>()
  for (const num of parsed.accessoryIds) {
    if (accMap.has(num)) continue
    const a = findAccessoryById(num)
    if (a) accMap.set(num, { ...a, isLocked: true })
  }

  // 所有道具（去重）
  const itemMap = new Map<string, Item>()
  for (const num of parsed.inventoryIds) {
    const it = findItemById(num, isGaiden)
    if (!itemMap.has(it.id)) itemMap.set(it.id, it)
  }

  return {
    accessories: Array.from(accMap.values()),
    allItems: Array.from(itemMap.values()),
    leftSlots: parsed.leftSlots,
    rightSlots: parsed.rightSlots,
    parsed,
  }
}

// ---- 文件读取 ----
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as ArrayBuffer)
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsArrayBuffer(file)
  })
}

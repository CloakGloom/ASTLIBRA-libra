import { Accessory, Effect, Category, Grade, Item } from '../types'
import { ACC_ACCESSORIES } from '../data/accessories'
import { GAIDEN_ACCESSORIES } from '../data/accessoriesGaiden'
import REAL_ITEMS from '../data/realItems'
import GAIDEN_ITEMS from '../data/realItemsGaiden'

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

  // 饰品: uint16 + uint32 双通道扫描，范围 1-68
  // uint16 最可靠；uint32 0x01XX 格式补充可能漏掉的饰品
  // 不扫 uint8 避免道具编号 1-68 混入
  const accAll = new Set<number>()
  // uint16 通道（主要通道，通常匹配实际饰品数量）
  for (let i = 0; i < dv.byteLength - 2; i += 2) {
    const v = dv.getUint16(i, true)
    if (v >= 1 && v <= 68) accAll.add(v)
  }
  // uint32 通道：0x01XX 格式补充
  for (let i = 0; i < dv.byteLength; i += 4) {
    const v = dv.getUint32(i, true)
    if (isAccessory(v) && (v & 0xFF) >= 1) accAll.add(v & 0xFF)
  }

  // 道具: 三通道合并扫描（uint8 + uint16 + uint32）
  const ITEM_MAX = 253
  const itemAll = new Set<number>()
  for (let i = 0; i < dv.byteLength; i++) {
    const v = dv.getUint8(i)
    if (v >= 1 && v <= ITEM_MAX) itemAll.add(v)
  }
  for (let i = 0; i < dv.byteLength - 2; i += 2) {
    const v = dv.getUint16(i, true)
    if (v >= 1 && v <= ITEM_MAX && (v >>> 8) !== 1) itemAll.add(v)
  }
  for (let i = 0; i < dv.byteLength; i += 4) {
    const v = dv.getUint32(i, true)
    if (v >= 1 && v <= ITEM_MAX && !isAccessory(v)) itemAll.add(v)
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
  return v >= 1 && v <= 253 && !isAccessory(v)
}

// ---- 映射到 App 内部数据 ----
export function findAccessoryById(num: number, isGaiden = false): Accessory | undefined {
  const id = `acc_${String(num).padStart(2, '0')}`
  const db = isGaiden ? GAIDEN_ACCESSORIES : ACC_ACCESSORIES
  return db.find(a => a.id === id)
}

export function findItemById(num: number, isGaiden = false): Item | undefined {
  const db = isGaiden ? GAIDEN_ITEMS : REAL_ITEMS
  const prefix = isGaiden ? 'g' : 'i'

  // 游戏道具编号 203-253 对应本篇数据库 i136-i186
  // 外传不用此映射（编号体系不同）
  if (!isGaiden) {
    const numToDb: Record<number, number> = {
      203: 136, 204: 144, 205: 145, 206: 146, 207: 147, 208: 148, 209: 149,
      210: 150, 211: 151, 212: 152, 213: 153, 214: 154, 215: 155, 216: 156,
      217: 157, 218: 158, 219: 159, 220: 160, 221: 161, 222: 136, 223: 163,
      224: 164, 225: 165, 226: 166, 227: 154, 228: 168, 229: 169, 230: 170,
      231: 171, 232: 172, 233: 173, 234: 174, 235: 175, 236: 176, 237: 177,
      238: 178, 239: 179, 240: 180, 241: 181, 242: 182, 243: 183, 244: 184,
      245: 185, 246: 186,
    }
    const mappedDbId = numToDb[num]
    if (mappedDbId) {
      const padded = String(mappedDbId).padStart(3, '0')
      const item = db.find(it => it.id === `i${padded}`)
      if (item) return item
    }
  }

  const padded = String(num).padStart(3, '0')
  // 尝试多种 ID 格式
  for (const pf of [prefix, `${prefix}_`]) {
    for (const sfx of [padded, `${num}`, `${num}b`, `${num}a`, `r${num}`, `rev_${num}`]) {
      const exact = db.find(it => it.id === `${pf}${sfx}`)
      if (exact) return exact
    }
  }
  // 模糊匹配
  const partial = db.find(it => it.id.includes(`_${num}`) || it.id.endsWith(String(num)) || it.id.endsWith(`${num}b`))
  if (partial) return partial
  // 无匹配道具
  return undefined
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
  // 饰品（导入为锁定状态 = false，由用户自行选择要配装的饰品）
  const accMap = new Map<number, Accessory>()
  for (const num of parsed.accessoryIds) {
    if (accMap.has(num)) continue
    const a = findAccessoryById(num, isGaiden)
    if (a) accMap.set(num, { ...a, isLocked: false })
  }

  // 所有道具（去重），跳过无法识别的编号（非真正道具）
  const itemMap = new Map<string, Item>()
  for (const num of parsed.inventoryIds) {
    const it = findItemById(num, isGaiden)
    if (it && !itemMap.has(it.id)) itemMap.set(it.id, it)
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

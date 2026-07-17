import { Accessory, AccessoryPrefs, Item, UserPreferences } from '../types'

const ITEMS_KEY = 'scale_items'
const PREFS_KEY = 'scale_prefs'
const ACC_KEY = 'acc_items'
const ACC_PREFS_KEY = 'acc_prefs'
const LOCK_KEY = 'scale_locks'
const SAVE_ID_KEY = 'scale_save_ids'

// ---- 道具库存：只持久化锁定状态和存档 ID，不持久化全量数据（始终从 REAL_ITEMS 初始化） ----
export interface ItemLock {
  isLocked: boolean
  lockedSide?: 'left' | 'right'
}

export function loadItemLocks(): Record<string, ItemLock> | null {
  try {
    const s = localStorage.getItem(LOCK_KEY)
    return s ? JSON.parse(s) : null
  } catch { return null }
}

export function saveItemLocks(locks: Record<string, ItemLock>): void {
  localStorage.setItem(LOCK_KEY, JSON.stringify(locks))
}

export function loadSaveIds(): string[] | null {
  try {
    const s = localStorage.getItem(SAVE_ID_KEY)
    return s ? JSON.parse(s) : null
  } catch { return null }
}

export function saveSaveIds(ids: string[]): void {
  localStorage.setItem(SAVE_ID_KEY, JSON.stringify(ids))
}

// ---- 道具库存（保留兼容旧格式） ----
export function loadItems(): Item[] | null {
  try {
    const s = localStorage.getItem(ITEMS_KEY)
    return s ? (JSON.parse(s) as Item[]) : null
  } catch { return null }
}

export function saveItems(items: Item[]): void {
  // 不再自动保存完整道具列表（改用锁定持久化），旧格式兼容保留
}

// ---- 偏好设置 ----
export function loadPrefs(): UserPreferences | null {
  try {
    const s = localStorage.getItem(PREFS_KEY)
    return s ? (JSON.parse(s) as UserPreferences) : null
  } catch { return null }
}

export function savePrefs(prefs: UserPreferences): void {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
}

// ---- 饰品模块持久化 ----
export function loadAccessories(): Accessory[] | null {
  try {
    const s = localStorage.getItem(ACC_KEY)
    return s ? (JSON.parse(s) as Accessory[]) : null
  } catch { return null }
}

export function saveAccessories(accessories: Accessory[]): void {
  localStorage.setItem(ACC_KEY, JSON.stringify(accessories))
}

export function loadAccessoryPrefs(): AccessoryPrefs | null {
  try {
    const s = localStorage.getItem(ACC_PREFS_KEY)
    return s ? (JSON.parse(s) as AccessoryPrefs) : null
  } catch { return null }
}

export function saveAccessoryPrefs(prefs: AccessoryPrefs): void {
  localStorage.setItem(ACC_PREFS_KEY, JSON.stringify(prefs))
}

import { useRef, useState } from 'react'
import { Button, message } from 'antd'
import { FolderOpenOutlined } from '@ant-design/icons'
import { Accessory, Item } from '../types'
import { extractLoadout, ParsedSave, parseSaveFile, readFileAsArrayBuffer } from '../utils/saveParser'

export interface SaveImportResult {
  accessories: Accessory[]
  items: Item[]
  leftSlots: number
  rightSlots: number
  parsed: ParsedSave
}

interface Props {
  isGaiden: boolean
  onImport: (data: SaveImportResult) => void
}

export function SaveImportButton({ isGaiden, onImport }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)
    try {
      const buf = await readFileAsArrayBuffer(file)
      const parsed = parseSaveFile(buf)
      const loadout = extractLoadout(parsed, isGaiden)

      onImport({
        accessories: loadout.accessories,
        items: loadout.allItems,
        leftSlots: loadout.leftSlots,
        rightSlots: loadout.rightSlots,
        parsed,
      })

      message.success(
        `存档导入成功！饰品 ${loadout.accessories.length} 件、背包道具 ${loadout.allItems.length} 件 ` +
        `(左盘 ${loadout.leftSlots} 槽 / 右盘 ${loadout.rightSlots} 槽)`,
      )
    } catch (err: any) {
      message.error(`存档导入失败：${err.message}`)
      console.error('[SaveImport]', err)
    } finally {
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <>
      <input ref={inputRef} type="file" accept=".DAT,.dat" style={{ display: 'none' }} onChange={handleFile} />
      <Button icon={<FolderOpenOutlined />} loading={loading} onClick={() => inputRef.current?.click()}>
        导入存档
      </Button>
    </>
  )
}

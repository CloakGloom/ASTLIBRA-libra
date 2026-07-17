import { Button, Upload, message } from 'antd'

interface Props {
  // 任意可序列化对象（天平模块传 {items, prefs, results}；饰品模块传 {accessories, prefs, results}）
  exportPayload: unknown
  onImport: (data: any) => void
  fileName?: string
}

// 数据导入 / 导出（一键导出当前仓库 + 方案为 JSON，方便分享配置）
export function DataIO({ exportPayload, onImport, fileName }: Props) {
  const exportData = () => {
    const payload = {
      version: 2,
      exportedAt: new Date().toISOString(),
      ...(exportPayload as object),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName ?? `optimizer-config-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    message.success('已导出配置')
  }

  const beforeUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result))
        onImport(data)
        message.success('配置已导入')
      } catch {
        message.error('JSON 解析失败')
      }
    }
    reader.readAsText(file)
    return false // 阻止自动上传
  }

  return (
    <div className="panel-card">
      <div className="panel-title">数据导入 / 导出</div>
      <div style={{ display: 'flex', gap: 10 }}>
        <Button onClick={exportData}>导出 JSON</Button>
        <Upload beforeUpload={beforeUpload} showUploadList={false} accept=".json">
          <Button>导入 JSON</Button>
        </Upload>
      </div>
    </div>
  )
}

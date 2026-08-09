import { DeleteOutlined } from '@ant-design/icons'
import { Button, Space, Switch, Table, Tag } from 'antd'
import { Accessory, ACC_CATEGORY_LABELS } from '../types'

interface Props {
  accessories: Accessory[]
  onChange: (accessories: Accessory[]) => void
}

// 饰品仓库：展示全部饰品及其属性 / 特殊效果，支持锁定（强制装备）与删除
export function AccessoryLibrary({ accessories, onChange }: Props) {
  const toggleLock = (id: string, locked: boolean) =>
    onChange(accessories.map((a) => (a.id === id ? { ...a, isLocked: locked } : a)))
  const remove = (id: string) => onChange(accessories.filter((a) => a.id !== id))

  const columns = [
    { title: '饰品', dataIndex: 'name' },
    {
      title: '属性 / 效果',
      render: (_: any, a: Accessory) => (
        <Space wrap size={2}>
          {a.effects.map((e, i) => (
            <Tag key={i}>
              {ACC_CATEGORY_LABELS[e.category]} {e.value > 0 ? '+' : ''}
              {e.value}
            </Tag>
          ))}
          {a.special ? (
            <Tag color="gold" title={a.special}>
              ★ {a.special}
            </Tag>
          ) : null}
        </Space>
      ),
    },
    {
      title: '锁定',
      width: 70,
      render: (_: any, a: Accessory) => (
        <Switch size="small" checked={!!a.isLocked} onChange={(v) => toggleLock(a.id, v)} />
      ),
    },
    {
      title: '',
      width: 40,
      render: (_: any, a: Accessory) => (
        <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => remove(a.id)} />
      ),
    },
  ]

  return (
    <div className="panel-card">
      <div className="panel-title" style={{ justifyContent: 'space-between' }}>
        <span>饰品仓库（{accessories.length}）</span>
        <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>锁定 = 强制装备</span>
      </div>
      <Table
        size="small"
        rowKey="id"
        columns={columns as any}
        dataSource={accessories}
        pagination={false}
        scroll={{ y: 300 }}
      />
    </div>
  )
}

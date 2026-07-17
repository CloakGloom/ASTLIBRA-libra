import { DeleteOutlined } from '@ant-design/icons'
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tag,
} from 'antd'
import { useMemo, useState } from 'react'
import { Category, CATEGORY_LABELS, Effect, GRADE_LABELS, Grade, Item } from '../types'

interface Props {
  items: Item[]
  saveItemIds: Set<string>
  onlySaveItems: boolean
  onOnlySaveChange: (v: boolean) => void
  onChange: (items: Item[]) => void
}

const CATS: Category[] = Object.keys(CATEGORY_LABELS) as Category[]

const genEffectId = () => `eff_${Date.now()}_${Math.floor(Math.random() * 1000)}`

export function ItemLibrary({ items, saveItemIds, onlySaveItems, onOnlySaveChange, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()
  const [filterSave, setFilterSave] = useState(true)

  // 筛选：全物品 or 仅存档物品
  const displayed = useMemo(() => {
    if (!filterSave || saveItemIds.size === 0) return items
    return items.filter((it) => saveItemIds.has(it.id))
  }, [items, filterSave, saveItemIds])

  const remove = (id: string) => onChange(items.filter((it) => it.id !== id))

  const toggleLock = (id: string, locked: boolean) => {
    onChange(items.map((it) => (it.id === id ? { ...it, isLocked: locked } : it)))
  }
  const setSide = (id: string, side: 'left' | 'right') => {
    onChange(items.map((it) => (it.id === id ? { ...it, lockedSide: side } : it)))
  }

  const submit = () => {
    form.validateFields().then((vals) => {
      const effects: Effect[] = (vals.effects || []).map((e: any) => ({
        id: genEffectId(),
        name: e.name,
        grade: e.grade,
        value: e.value,
        category: e.category,
      }))
      const newItem: Item = {
        id: `it_${Date.now()}`,
        name: vals.name,
        weight: vals.weight,
        effects,
      }
      onChange([...items, newItem])
      setOpen(false)
      form.resetFields()
    })
  }

  const columns = [
    {
      title: '道具',
      dataIndex: 'name',
    },
    {
      title: '重量',
      dataIndex: 'weight',
      width: 70,
    },
    {
      title: '词条',
      render: (_: any, it: Item) => (
        <Space wrap size={2}>
          {it.effects.map((e, i) => (
            <Tag key={i} className={`grade-${e.grade}`}>
              {GRADE_LABELS[e.grade]} {CATEGORY_LABELS[e.category]} {e.value > 0 ? '+' : ''}{e.value}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '锁定',
      width: 160,
      render: (_: any, it: Item) => (
        <Space size={4}>
          <Switch
            size="small"
            checked={!!it.isLocked}
            onChange={(v) => toggleLock(it.id, v)}
          />
          <Select
            size="small"
            style={{ width: 76 }}
            disabled={!it.isLocked}
            value={it.lockedSide || 'left'}
            onChange={(v) => setSide(it.id, v)}
            options={[
              { value: 'left', label: '左盘' },
              { value: 'right', label: '右盘' },
            ]}
          />
        </Space>
      ),
    },
    {
      title: '',
      width: 40,
      render: (_: any, it: Item) => (
        <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => remove(it.id)} />
      ),
    },
  ]

  return (
    <div className="panel-card">
      <div className="panel-title" style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
        <span>道具仓库（{displayed.length}/{items.length}）</span>
        <Space size={8}>
          <Space size={4}>
            <Switch size="small" checked={filterSave} onChange={setFilterSave} disabled={saveItemIds.size === 0} />
            <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>显示</span>
          </Space>
          <Space size={4}>
            <Switch size="small" checked={onlySaveItems} onChange={onOnlySaveChange} disabled={saveItemIds.size === 0} />
            <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>仅算</span>
          </Space>
          <Button type="primary" size="small" onClick={() => setOpen(true)}>
            + 新增道具
          </Button>
        </Space>
      </div>
      <Table
        size="small"
        rowKey="id"
        columns={columns as any}
        dataSource={displayed}
        pagination={false}
        scroll={{ y: 280 }}
      />

      <Modal title="新增道具" open={open} onOk={submit} onCancel={() => setOpen(false)} okText="添加">
        <Form form={form} layout="vertical" initialValues={{ weight: 10, effects: [] }}>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="weight" label="重量">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.List name="effects">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field) => (
                  <Space key={field.key} align="baseline" style={{ display: 'flex', marginBottom: 6 }}>
                    <Form.Item name={[field.name, 'name']} rules={[{ required: true }]}>
                      <Input placeholder="词条名" style={{ width: 90 }} />
                    </Form.Item>
                    <Form.Item name={[field.name, 'category']} rules={[{ required: true }]}>
                      <Select
                        placeholder="类别"
                        style={{ width: 100 }}
                        options={CATS.map((c) => ({ value: c, label: CATEGORY_LABELS[c] }))}
                      />
                    </Form.Item>
                    <Form.Item name={[field.name, 'grade']} rules={[{ required: true }]}>
                      <Select
                        placeholder="等级"
                        style={{ width: 70 }}
                        options={([0, 1, 2, 3] as Grade[]).map((g) => ({
                          value: g,
                          label: GRADE_LABELS[g],
                        }))}
                      />
                    </Form.Item>
                    <Form.Item name={[field.name, 'value']} rules={[{ required: true }]}>
                      <InputNumber placeholder="值" min={0} style={{ width: 70 }} />
                    </Form.Item>
                    <DeleteOutlined onClick={() => remove(field.name)} />
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} block>
                  + 添加词条
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>
    </div>
  )
}

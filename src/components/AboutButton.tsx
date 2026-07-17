import { useState } from 'react'
import { Button, Modal, Space } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'

export function AboutButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        type="text"
        size="small"
        icon={<InfoCircleOutlined />}
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          bottom: 12,
          right: 12,
          color: 'var(--text-dim)',
          fontSize: 12,
          zIndex: 1000,
        }}
      >
        关于...
      </Button>
      <Modal
        title="关于"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={360}
      >
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <div>
            <div style={{ color: 'var(--text-dim)', marginBottom: 4 }}>数据来源</div>
            <a
              href="https://w.atwiki.jp/astlibra/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 13 }}
            >
              ASTLIBRA @ ウィキ - atwiki
            </a>
          </div>
          <div>
            <div style={{ color: 'var(--text-dim)', marginBottom: 4 }}>作者</div>
            <a
              href="https://space.bilibili.com/199190474"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 13 }}
            >
              Bilibili 个人空间
            </a>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 8 }}>
            ASTLIBRA 天平配平优化器 · 纯前端 · 遗传算法 / 组合枚举寻优
          </div>
        </Space>
      </Modal>
    </>
  )
}

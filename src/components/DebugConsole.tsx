import { Collapse } from 'antd'

interface Props {
  running: boolean
  iterations: number
  elapsed: number
  bestFitness: number
  progress: { iteration: number; elapsed: number } | null
}

// 开发者调试控制台（页面底部折叠面板）
export function DebugConsole({ running, iterations, elapsed, bestFitness, progress }: Props) {
  const log = [
    `状态          : ${running ? '运行中' : '空闲'}`,
    `迭代次数      : ${iterations}`,
    `耗时(毫秒)    : ${elapsed}`,
    `最佳适应度    : ${bestFitness.toFixed(2)}`,
    progress ? `最后进度      : 代数=${progress.iteration} 耗时=${progress.elapsed}毫秒` : '最后进度      : -',
  ].join('\n')

  return (
    <div className="panel-card">
      <Collapse
        ghost
        items={[
          {
            key: 'debug',
            label: <span style={{ color: 'var(--text-dim)' }}>调试控制台 ▾</span>,
            children: <div className="debug-panel">{log}</div>,
          },
        ]}
      />
    </div>
  )
}

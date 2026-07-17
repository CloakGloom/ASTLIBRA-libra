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
    `status        : ${running ? 'RUNNING' : 'IDLE'}`,
    `iterations    : ${iterations}`,
    `elapsed(ms)   : ${elapsed}`,
    `bestFitness   : ${bestFitness.toFixed(2)}`,
    progress ? `lastProgress  : gen=${progress.iteration} t=${progress.elapsed}ms` : 'lastProgress  : -',
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

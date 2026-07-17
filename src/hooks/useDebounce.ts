import { useEffect, useState } from 'react'

// 防抖 Hook：值变化后延迟 delay 毫秒再返回新值（用于权重滑块 / 槽位变更的重计算）
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(id)
  }, [value, delay])
  return debounced
}

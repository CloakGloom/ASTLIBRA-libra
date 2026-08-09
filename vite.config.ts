import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Web Worker 以 ES module 形式打包，算法逻辑全部放在 Worker 中运行，防止主线程卡顿
export default defineConfig({
  plugins: [react()],
  worker: {
    format: 'es',
  },
  server: {
    port: 5555,
  },
  preview: {
    port: 5555,
  },
})

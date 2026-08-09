/// <reference lib="webworker" />
import { findBestCombination } from './engine'
import { RunPayload, RunResult, RunProgress } from './types'

declare const self: DedicatedWorkerGlobalScope

self.onmessage = (e: MessageEvent<{ type: string; payload: RunPayload }>) => {
  const { payload } = e.data
  const result: RunResult = findBestCombination(
    payload.items,
    payload.preferences,
    payload.constraints,
    (p: RunProgress) => self.postMessage({ type: 'progress', payload: p }),
  )
  self.postMessage({ type: 'done', payload: result })
}

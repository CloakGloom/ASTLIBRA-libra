/// <reference lib="webworker" />
import { findBestAccessoryCombo } from './accessoryEngine'
import { AccessoryRunPayload, AccessoryRunResult, AccessoryRunProgress } from './accessoryTypes'

declare const self: DedicatedWorkerGlobalScope

self.onmessage = (e: MessageEvent<{ type: string; payload: AccessoryRunPayload }>) => {
  const { payload } = e.data
  const result: AccessoryRunResult = findBestAccessoryCombo(
    payload.accessories,
    payload.weights,
    payload.slotCount,
    (p: AccessoryRunProgress) => self.postMessage({ type: 'progress', payload: p }),
  )
  self.postMessage({ type: 'done', payload: result })
}

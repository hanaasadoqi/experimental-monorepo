export type OperationStatus = "idle" | "pending" | "success" | "error"
export interface OperationState {
  status: OperationStatus
  pendingCount: number
  error?: unknown
}
export const DEFAULT_OPERATION_STATE: OperationState = {
  status: "idle",
  pendingCount: 0,
}

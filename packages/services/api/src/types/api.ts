import type { AxiosRequestConfig } from "axios"

export interface ApiResponse<T = unknown> {
  data: T
  status: number
  statusText: string
}

export interface ApiError {
  message: string
  status?: number
  code?: string
}

export interface RequestConfig extends AxiosRequestConfig {
  retryCount?: number
}

export interface ApiClient {
  get<T = unknown>(url: string, config?: RequestConfig): Promise<T>
  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T>
  put<T = unknown>(
    url: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<T>
  delete<T = unknown>(url: string, config?: RequestConfig): Promise<T>
}

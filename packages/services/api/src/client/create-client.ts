import axios from "axios"
import type { AxiosInstance } from "axios"

import type { ApiClient, RequestConfig } from "../types/api.js"

interface CreateClientOptions {
  baseURL?: string
  timeout?: number
}

export const createApiClient = (
  options?: CreateClientOptions
): ApiClient => {
  const instance: AxiosInstance = axios.create({
    baseURL: options?.baseURL || "/api",
    timeout: options?.timeout || 10000,
  })

  return {
    async get<T = unknown>(url: string, config?: RequestConfig): Promise<T> {
      const response = await instance.get<T>(url, config)
      return response.data
    },
    async post<T = unknown>(
      url: string,
      data?: unknown,
      config?: RequestConfig
    ): Promise<T> {
      const response = await instance.post<T>(url, data, config)
      return response.data
    },
    async put<T = unknown>(
      url: string,
      data?: unknown,
      config?: RequestConfig
    ): Promise<T> {
      const response = await instance.put<T>(url, data, config)
      return response.data
    },
    async delete<T = unknown>(
      url: string,
      config?: RequestConfig
    ): Promise<T> {
      const response = await instance.delete<T>(url, config)
      return response.data
    },
  }
}

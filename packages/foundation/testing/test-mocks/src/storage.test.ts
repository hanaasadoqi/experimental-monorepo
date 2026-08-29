import { describe, expect, it } from 'vitest'

import { MemoryStorage } from './storage.js'

describe('MemoryStorage', () => {
  it('stores string values and removes them deterministically', () => {
    const storage = new MemoryStorage()

    storage.setItem('count', '1')
    expect(storage.getItem('count')).toBe('1')
    expect(storage.length).toBe(1)

    storage.removeItem('count')
    expect(storage.getItem('count')).toBeNull()
    expect(storage.length).toBe(0)
  })
})

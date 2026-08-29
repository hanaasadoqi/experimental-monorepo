import { describe, expect, it } from "vitest"

import { generateUser, generateUsers } from "./user.js"

describe("User fixtures", () => {
  it("generates a single user with all required fields", () => {
    const user = generateUser()

    expect(user).toHaveProperty("id")
    expect(user).toHaveProperty("name")
    expect(user).toHaveProperty("email")
    expect(user).toHaveProperty("avatar")
    expect(user).toHaveProperty("createdAt")

    expect(typeof user.id).toBe("string")
    expect(typeof user.name).toBe("string")
    expect(typeof user.email).toBe("string")
    expect(typeof user.avatar).toBe("string")
    expect(user.createdAt).toBeInstanceOf(Date)
  })

  it("generates users with unique IDs", () => {
    const users = generateUsers(5)
    const ids = new Set(users.map((u) => u.id))

    expect(ids.size).toBe(5)
  })

  it("generates the correct number of users", () => {
    expect(generateUsers(1)).toHaveLength(1)
    expect(generateUsers(10)).toHaveLength(10)
    expect(generateUsers(100)).toHaveLength(100)
  })

  it("generates users with valid email format", () => {
    const users = generateUsers(5)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    users.forEach((user) => {
      expect(user.email).toMatch(emailRegex)
    })
  })

  it("defaults to 10 users when no count provided", () => {
    const users = generateUsers()
    expect(users).toHaveLength(10)
  })

  it("generates users with past creation dates", () => {
    const now = new Date()
    const users = generateUsers(10)

    users.forEach((user) => {
      expect(user.createdAt.getTime()).toBeLessThan(now.getTime())
    })
  })
})

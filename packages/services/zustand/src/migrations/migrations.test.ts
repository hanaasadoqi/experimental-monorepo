import { describe, it, expect, beforeEach } from "vitest"
import {
  MigrationPlan,
  createMigrationPlan,
  createVersionedState,
  extractState,
  getVersion,
  type Migration as _Migration,
  type MigrationDefinition,
  type VersionedState as _VersionedState,
} from "./index.js"

describe("Migrations", () => {
  describe("MigrationPlan", () => {
    interface V0State {
      count: number
    }

    interface V1State {
      count: number
      id: string
    }

    interface V2State {
      count: number
      id: string
      metadata: Record<string, unknown>
    }

    const definitions: MigrationDefinition[] = [
      {
        fromVersion: 0,
        toVersion: 1,
        migrate: (state: unknown) => ({
          ...(state as V0State),
          id: "default-id",
        }),
        description: "Add id field",
      },
      {
        fromVersion: 1,
        toVersion: 2,
        migrate: (state: unknown) => ({
          ...(state as V1State),
          metadata: { created: new Date().toISOString() },
        }),
        description: "Add metadata field",
      },
    ]

    let plan: MigrationPlan

    beforeEach(() => {
      plan = new MigrationPlan(definitions)
    })

    it("should get max version", () => {
      expect(plan.getMaxVersion()).toBe(2)
    })

    it("should determine if migration path exists", () => {
      expect(plan.canMigrate(0, 1)).toBe(true)
      expect(plan.canMigrate(0, 2)).toBe(true)
      expect(plan.canMigrate(1, 2)).toBe(true)
    })

    it("should return false for non-existent migration paths", () => {
      expect(plan.canMigrate(2, 3)).toBe(false)
      expect(plan.canMigrate(1, 3)).toBe(false)
    })

    it("should return false for same version", () => {
      expect(plan.canMigrate(1, 1)).toBe(false)
      expect(plan.canMigrate(0, 0)).toBe(false)
    })

    it("should return false for backward migrations", () => {
      expect(plan.canMigrate(2, 0)).toBe(false)
      expect(plan.canMigrate(1, 0)).toBe(false)
    })

    it("should migrate state through single version", () => {
      const state: V0State = { count: 42 }
      const migrated = plan.migrate<V0State | V1State>(state, 0, 1)

      expect(migrated).toHaveProperty("count", 42)
      expect(migrated).toHaveProperty("id")
    })

    it("should migrate state through multiple versions", () => {
      const state: V0State = { count: 42 }
      const migrated = plan.migrate<V0State | V1State | V2State>(state, 0, 2)

      expect(migrated).toHaveProperty("count", 42)
      expect(migrated).toHaveProperty("id")
      expect(migrated).toHaveProperty("metadata")
    })

    it("should skip migration when versions are same", () => {
      const state: V1State = { count: 42, id: "test" }
      const result = plan.migrate(state, 1, 1)
      expect(result).toBe(state)
    })

    it("should throw error for backward migration", () => {
      const state: V2State = { count: 42, id: "test", metadata: {} }

      expect(() => {
        plan.migrate(state, 2, 0)
      }).toThrow(/Cannot migrate backwards/)
    })

    it("should throw error for missing migration path", () => {
      const state: V0State = { count: 42 }

      expect(() => {
        plan.migrate(state, 0, 3)
      }).toThrow(/No migration available/)
    })

    it("should throw error with cause when migration function fails", () => {
      const failingDef: MigrationDefinition = {
        fromVersion: 0,
        toVersion: 1,
        migrate: () => {
          throw new Error("Migration logic error")
        },
      }

      const failingPlan = new MigrationPlan([failingDef])
      const state: V0State = { count: 42 }

      try {
        failingPlan.migrate(state, 0, 1)
        expect.fail("Should have thrown")
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toContain("Migration failed")
      }
    })

    it("should handle multiple migrations in sequence", () => {
      const migrations: MigrationDefinition[] = []

      for (let i = 0; i < 5; i++) {
        migrations.push({
          fromVersion: i,
          toVersion: i + 1,
          migrate: (state: unknown) => ({
            ...(state as Record<string, unknown>),
            version: i + 1,
          }),
        })
      }

      const sequencePlan = new MigrationPlan(migrations)
      const state = { value: "initial" }
      const result = sequencePlan.migrate(state, 0, 5)

      expect(result).toHaveProperty("value", "initial")
    })
  })

  describe("createMigrationPlan", () => {
    it("should create plan from definitions", () => {
      const definitions: MigrationDefinition[] = [
        {
          fromVersion: 0,
          toVersion: 1,
          migrate: (s: unknown) => s,
        },
      ]

      const plan = createMigrationPlan(definitions)
      expect(plan).toBeInstanceOf(MigrationPlan)
      expect(plan.getMaxVersion()).toBe(1)
    })

    it("should create plan from empty definitions", () => {
      const plan = createMigrationPlan([])
      expect(plan).toBeInstanceOf(MigrationPlan)
      expect(plan.getMaxVersion()).toBe(0)
    })
  })

  describe("createVersionedState", () => {
    interface TestState {
      count: number
    }

    it("should wrap state with version and metadata", () => {
      const state: TestState = { count: 42 }
      const versioned = createVersionedState(state, 1)

      expect(versioned).toHaveProperty("version", 1)
      expect(versioned).toHaveProperty("state", state)
      expect(versioned).toHaveProperty("_meta")
    })

    it("should include migration timestamp", () => {
      const state: TestState = { count: 42 }
      const before = new Date().toISOString()
      const versioned = createVersionedState(state, 1)
      const after = new Date().toISOString()

      expect(versioned._meta?.migratedAt).toBeDefined()
      expect(versioned._meta!.migratedAt! >= before).toBe(true)
      expect(versioned._meta!.migratedAt! <= after).toBe(true)
    })

    it("should include custom metadata", () => {
      const state: TestState = { count: 42 }
      const versioned = createVersionedState(state, 1, {
        fromVersion: 0,
      })

      expect(versioned._meta?.fromVersion).toBe(0)
    })

    it("should preserve state reference", () => {
      const state: TestState = { count: 42 }
      const versioned = createVersionedState(state, 1)

      expect(versioned.state).toStrictEqual(state)
    })
  })

  describe("extractState", () => {
    interface TestState {
      count: number
    }

    it("should extract state from versioned wrapper", () => {
      const state: TestState = { count: 42 }
      const versioned = createVersionedState(state, 1)

      const extracted = extractState<TestState>(versioned)
      expect(extracted).toEqual(state)
    })

    it("should return plain state if not versioned", () => {
      const state: TestState = { count: 42 }
      const extracted = extractState<TestState>(state)

      expect(extracted).toEqual(state)
    })

    it("should handle null gracefully", () => {
      const extracted = extractState<TestState | null>(null)
      expect(extracted).toBeNull()
    })

    it("should handle undefined gracefully", () => {
      const extracted = extractState<TestState | undefined>(undefined)
      expect(extracted).toBeUndefined()
    })

    it("should handle objects without version property", () => {
      const obj = { count: 42, other: "data" }
      const extracted = extractState(obj)

      expect(extracted).toEqual(obj)
    })

    it("should handle versioned state with complex nested state", () => {
      const complexState = {
        user: {
          name: "John",
          profile: {
            age: 30,
          },
        },
        settings: {
          theme: "dark",
        },
      }

      const versioned = createVersionedState(complexState, 1)
      const extracted = extractState(versioned)

      expect(extracted).toEqual(complexState)
    })
  })

  describe("getVersion", () => {
    interface TestState {
      count: number
    }

    it("should get version from versioned state", () => {
      const versioned = createVersionedState({ count: 42 }, 3)
      expect(getVersion(versioned)).toBe(3)
    })

    it("should return 0 for plain state", () => {
      const state: TestState = { count: 42 }
      expect(getVersion(state)).toBe(0)
    })

    it("should return 0 for state with non-numeric version", () => {
      const state = { version: "1.0" }
      expect(getVersion(state)).toBe(0)
    })

    it("should return 0 for null", () => {
      expect(getVersion(null)).toBe(0)
    })

    it("should return 0 for undefined", () => {
      expect(getVersion(undefined)).toBe(0)
    })

    it("should return 0 for primitives", () => {
      expect(getVersion("string")).toBe(0)
      expect(getVersion(42)).toBe(0)
      expect(getVersion(true)).toBe(0)
    })

    it("should return version from raw object with version property", () => {
      const obj = { version: 5, data: "test" }
      expect(getVersion(obj)).toBe(5)
    })

    it("should handle versioned state with zero version", () => {
      const versioned = createVersionedState({ count: 0 }, 0)
      expect(getVersion(versioned)).toBe(0)
    })
  })

  describe("Integration: Migration Pipeline", () => {
    interface V0 {
      name: string
    }

    interface V1 {
      name: string
      id: string
    }

    interface V2 {
      name: string
      id: string
      createdAt: string
    }

    it("should handle full migration lifecycle", () => {
      const plan = new MigrationPlan([
        {
          fromVersion: 0,
          toVersion: 1,
          migrate: (s: unknown) => ({
            ...(s as V0),
            id: "new-id",
          }),
        },
        {
          fromVersion: 1,
          toVersion: 2,
          migrate: (s: unknown) => ({
            ...(s as V1),
            createdAt: new Date().toISOString(),
          }),
        },
      ])

      // Start with v0 data
      const v0Data: V0 = { name: "John" }
      const versioned = createVersionedState(v0Data, 0)

      // Migrate to v2
      const migrated = plan.migrate(versioned.state, 0, 2)
      const v2Data = migrated as V2

      expect(v2Data.name).toBe("John")
      expect(v2Data).toHaveProperty("id")
      expect(v2Data).toHaveProperty("createdAt")

      // Check version
      expect(getVersion(v2Data)).toBe(0) // Raw state has no version
    })

    it("should wrap migrated state with version info", () => {
      const plan = new MigrationPlan([
        {
          fromVersion: 0,
          toVersion: 1,
          migrate: (s: unknown) => ({ ...(s as V0), id: "id" }),
        },
      ])

      const v0Data: V0 = { name: "Jane" }
      const migrated = plan.migrate(v0Data, 0, 1)
      const versioned = createVersionedState(migrated as V1, 1, {
        fromVersion: 0,
      })

      expect(versioned.version).toBe(1)
      expect(versioned._meta?.fromVersion).toBe(0)
      expect((versioned.state as V1).id).toBe("id")
    })
  })
})

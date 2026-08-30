import { renderToString } from "react-dom/server"
import { act, fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import type { AppearancePreference } from "@repo/shared-contracts/types/domain.js"

import {
  PreferencesProvider,
  useAppearancePreference,
  useSetAppearancePreference,
  type PreferencesPersistenceAdapter,
} from "./index"

interface TestAdapter extends PreferencesPersistenceAdapter {
  emit(preference: AppearancePreference): void
  value(): AppearancePreference | null
  writes(): number
}

function createTestAdapter(initial: AppearancePreference | null): TestAdapter {
  let current = initial
  let writeCount = 0
  const listeners = new Set<(preference: AppearancePreference) => void>()

  return {
    read: () => current,
    write(preference) {
      current = preference
      writeCount += 1
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    emit(preference) {
      current = preference
      for (const listener of listeners) listener(preference)
    },
    value: () => current,
    writes: () => writeCount,
  }
}

function PreferenceControl() {
  const preference = useAppearancePreference()
  const setPreference = useSetAppearancePreference()

  return <button onClick={() => setPreference("dark")}>{preference}</button>
}

describe("PreferencesProvider", () => {
  it("prefers server bootstrap intent over browser persistence", () => {
    render(
      <PreferencesProvider
        adapter={createTestAdapter("dark")}
        initialPreference="light"
      >
        <PreferenceControl />
      </PreferencesProvider>
    )

    expect(screen.getByRole("button").textContent).toBe("light")
  })

  it("uses persisted intent when server intent is absent", () => {
    render(
      <PreferencesProvider adapter={createTestAdapter("dark")}>
        <PreferenceControl />
      </PreferencesProvider>
    )

    expect(screen.getByRole("button").textContent).toBe("dark")
  })

  it("persists a user preference change", () => {
    const adapter = createTestAdapter("light")

    render(
      <PreferencesProvider adapter={adapter}>
        <PreferenceControl />
      </PreferencesProvider>
    )
    fireEvent.click(screen.getByRole("button"))

    expect(screen.getByRole("button").textContent).toBe("dark")
    expect(adapter.value()).toBe("dark")
    expect(adapter.writes()).toBe(1)
  })

  it("applies an external preference without writing it back", () => {
    const adapter = createTestAdapter("light")

    render(
      <PreferencesProvider adapter={adapter}>
        <PreferenceControl />
      </PreferencesProvider>
    )
    act(() => adapter.emit("dark"))

    expect(screen.getByRole("button").textContent).toBe("dark")
    expect(adapter.writes()).toBe(0)
  })

  it("supplies a server snapshot for server-rendered consumers", () => {
    expect(() =>
      renderToString(
        <PreferencesProvider
          adapter={createTestAdapter(null)}
          initialPreference="system"
        >
          <PreferenceControl />
        </PreferencesProvider>
      )
    ).not.toThrow()
  })
})

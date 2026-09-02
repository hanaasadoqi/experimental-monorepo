import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import type { AppearancePreference } from "../model/index.js"

import { PreferencesProvider } from "./preferences-provider.js"
import { useAppearancePreference } from "./use-appearance-preference.js"
import { useSetAppearancePreference } from "./use-set-appearance-preference.js"

function PreferenceConsumer({ testId }: { testId: string }) {
  const appearance = useAppearancePreference()
  const setAppearance = useSetAppearancePreference()

  return (
    <section>
      <output data-testid={`${testId}-appearance`}>{appearance}</output>
      <button onClick={() => setAppearance("system")}>Set {testId}</button>
    </section>
  )
}

function renderProvider(
  initialAppearance: AppearancePreference | undefined,
  testId = "preference"
) {
  return render(
    <PreferencesProvider initialAppearance={initialAppearance}>
      <PreferenceConsumer testId={testId} />
    </PreferencesProvider>
  )
}

describe("PreferencesProvider", () => {
  it("provides the default appearance preference to its hooks", () => {
    renderProvider(undefined)

    expect(screen.getByTestId("preference-appearance").textContent).toBe(
      "system"
    )
  })

  it.each(["light", "dark", "system"] as const)(
    "provides the initial %s appearance preference to its hooks",
    (appearance) => {
      renderProvider(appearance)

      expect(screen.getByTestId("preference-appearance").textContent).toBe(
        appearance
      )
    }
  )

  it("updates the provider-owned store through the command hook", () => {
    renderProvider("light")

    fireEvent.click(screen.getByRole("button", { name: "Set preference" }))

    expect(screen.getByTestId("preference-appearance").textContent).toBe(
      "system"
    )
  })

  it("keeps two provider-owned stores isolated", () => {
    render(
      <>
        <PreferencesProvider initialAppearance="light">
          <PreferenceConsumer testId="first" />
        </PreferencesProvider>
        <PreferencesProvider initialAppearance="dark">
          <PreferenceConsumer testId="second" />
        </PreferencesProvider>
      </>
    )

    fireEvent.click(screen.getByRole("button", { name: "Set first" }))

    expect(screen.getByTestId("first-appearance").textContent).toBe("system")
    expect(screen.getByTestId("second-appearance").textContent).toBe("dark")
  })

  it("throws when a preferences hook is used without a provider", () => {
    expect(() => render(<PreferenceConsumer testId="orphan" />)).toThrow(
      "PreferencesStoreContext provider is missing"
    )
  })
})

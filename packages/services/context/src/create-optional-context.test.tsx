import { act, type ReactElement } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, describe, expect, it } from "vitest"

import { createOptionalContext } from "./create-optional-context"

const containers: HTMLElement[] = []

function renderComponent(component: ReactElement) {
  const container = document.createElement("div")
  document.body.append(container)
  containers.push(container)

  act(() => createRoot(container).render(component))

  return container
}

afterEach(() => {
  for (const container of containers.splice(0)) container.remove()
})

describe("createOptionalContext", () => {
  it("creates a context object with the required properties", () => {
    interface TestValue {
      name: string
    }

    const result = createOptionalContext<TestValue>("TestContext")

    expect(result).toHaveProperty("Context")
    expect(result).toHaveProperty("Provider")
    expect(result).toHaveProperty("useOptionalValue")
  })

  it("sets the displayName on the Context", () => {
    const result = createOptionalContext("MyContext")

    expect(result.Context.displayName).toBe("MyContext")
  })

  it("sets the displayName on the Provider", () => {
    const result = createOptionalContext("MyContext")

    // The Provider is assigned a displayName property after function declaration
    const providerWithName = result.Provider as unknown as {
      displayName?: string
    }
    expect(providerWithName.displayName).toBe("MyContextProvider")
  })

  it("returns null from useOptionalValue when not wrapped in provider", () => {
    interface TestValue {
      id: string
    }

    const { useOptionalValue } = createOptionalContext<TestValue>("TestContext")

    function TestComponent() {
      const value = useOptionalValue()
      return <div>{value === null ? "null" : "has value"}</div>
    }

    const container = renderComponent(<TestComponent />)
    expect(container.textContent).toBe("null")
  })

  it("provides the value to useOptionalValue when wrapped in provider", () => {
    interface TestValue {
      id: string
      name: string
    }

    const { Provider, useOptionalValue } =
      createOptionalContext<TestValue>("TestContext")

    const testValue = { id: "123", name: "Test" }

    function TestComponent() {
      const value = useOptionalValue()
      return <div>{value ? `${value.id}-${value.name}` : "no value"}</div>
    }

    const container = renderComponent(
      <Provider value={testValue}>
        <TestComponent />
      </Provider>
    )

    expect(container.textContent).toBe("123-Test")
  })

  it("returns the correct value type from useOptionalValue", () => {
    interface User {
      id: number
      email: string
      role: "admin" | "user"
    }

    const { Provider, useOptionalValue } = createOptionalContext<User>("UserContext")

    const user: User = { id: 1, email: "test@example.com", role: "admin" }

    function TestComponent() {
      const value = useOptionalValue()

      if (value === null) {
        return <div>no user</div>
      }

      return (
        <div>
          {value.id}-{value.email}-{value.role}
        </div>
      )
    }

    const container = renderComponent(
      <Provider value={user}>
        <TestComponent />
      </Provider>
    )

    expect(container.textContent).toBe("1-test@example.com-admin")
  })

  it("works with nested providers using the same context", () => {
    interface Value {
      level: number
    }

    const { Provider, useOptionalValue } = createOptionalContext<Value>("NestedContext")

    function TestComponent() {
      const value = useOptionalValue()
      return <div>{value?.level ?? "none"}</div>
    }

    const container = renderComponent(
      <Provider value={{ level: 1 }}>
        <div>
          <TestComponent />
          <Provider value={{ level: 2 }}>
            <TestComponent />
          </Provider>
        </div>
      </Provider>
    )

    const divs = container.querySelectorAll("div")
    // Last two divs should have the content
    expect(divs[divs.length - 2]?.textContent).toBe("1")
    expect(divs[divs.length - 1]?.textContent).toBe("2")
  })

  it("allows updating the value by re-rendering with a new value", () => {
    interface Counter {
      count: number
    }

    const { Provider, useOptionalValue } =
      createOptionalContext<Counter>("CounterContext")

    function TestComponent() {
      const value = useOptionalValue()
      return <div>{value?.count ?? "no value"}</div>
    }

    const container = renderComponent(
      <Provider value={{ count: 0 }}>
        <TestComponent />
      </Provider>
    )

    expect(container.textContent).toBe("0")

    act(() => {
      createRoot(container).render(
        <Provider value={{ count: 1 }}>
          <TestComponent />
        </Provider>
      )
    })

    expect(container.textContent).toBe("1")
  })

  it("handles multiple components consuming the context", () => {
    interface Shared {
      message: string
    }

    const { Provider, useOptionalValue } =
      createOptionalContext<Shared>("SharedContext")

    function ConsumerA() {
      const value = useOptionalValue()
      return <div data-testid="consumer-a">{value?.message ?? "empty"}</div>
    }

    function ConsumerB() {
      const value = useOptionalValue()
      return <div data-testid="consumer-b">{value?.message ?? "empty"}</div>
    }

    const container = renderComponent(
      <Provider value={{ message: "hello" }}>
        <ConsumerA />
        <ConsumerB />
      </Provider>
    )

    const consumerA = container.querySelector("[data-testid='consumer-a']")
    const consumerB = container.querySelector("[data-testid='consumer-b']")

    expect(consumerA?.textContent).toBe("hello")
    expect(consumerB?.textContent).toBe("hello")
  })

  it("handles undefined values correctly", () => {
    interface OptionalValue {
      data?: string
    }

    const { Provider, useOptionalValue } =
      createOptionalContext<OptionalValue>("TestContext")

    function TestComponent() {
      const value = useOptionalValue()
      return <div>{value?.data ?? "undefined"}</div>
    }

    const container = renderComponent(
      <Provider value={{}}>
        <TestComponent />
      </Provider>
    )

    expect(container.textContent).toBe("undefined")
  })

  it("properly exposes the Context for use with useContext", () => {
    interface TestValue {
      test: string
    }

    const { Context, Provider, useOptionalValue } =
      createOptionalContext<TestValue>("TestContext")

    // Verify that Context is a valid React Context
    expect(Context).toBeDefined()
    expect(typeof Context.Provider).toBe("object")

    function TestComponent() {
      // Both useOptionalValue and direct useContext should work
      const value = useOptionalValue()

      return <div>{value ? "has value" : "no value"}</div>
    }

    const container = renderComponent(
      <Provider value={{ test: "value" }}>
        <TestComponent />
      </Provider>
    )

    // This test verifies the Context is properly constructed
    expect(container.textContent).toBe("has value")
  })

  it("correctly distinguishes falsy values from null (no provider)", () => {
    // CRITICAL: Distinguishing between falsy T values and null (missing provider)
    const boolContext = createOptionalContext<boolean>("BoolContext")
    const numberContext = createOptionalContext<number>("NumberContext")
    const stringContext = createOptionalContext<string>("StringContext")

    function BoolComponent() {
      const value = boolContext.useOptionalValue()
      // MUST use === null, not truthiness check
      return (
        <div>
          {value === null
            ? "no-provider"
            : value === true
              ? "true"
              : "false"}
        </div>
      )
    }

    function NumberComponent() {
      const value = numberContext.useOptionalValue()
      // MUST use === null, not truthiness check
      return (
        <div>
          {value === null ? "no-provider" : `num-${value}`}
        </div>
      )
    }

    function StringComponent() {
      const value = stringContext.useOptionalValue()
      // MUST use === null, not truthiness check
      return (
        <div>
          {value === null ? "no-provider" : `str-${value || "empty"}`}
        </div>
      )
    }

    // Test with false, 0, and empty string values
    const container1 = renderComponent(
      <boolContext.Provider value={false}>
        <BoolComponent />
      </boolContext.Provider>
    )
    expect(container1.textContent).toBe("false") // Not "no-provider"!

    const container2 = renderComponent(
      <numberContext.Provider value={0}>
        <NumberComponent />
      </numberContext.Provider>
    )
    expect(container2.textContent).toBe("num-0") // Not "no-provider"!

    const container3 = renderComponent(
      <stringContext.Provider value="">
        <StringComponent />
      </stringContext.Provider>
    )
    expect(container3.textContent).toBe("str-empty") // Not "no-provider"!

    // Test without provider (should be null)
    function TestNoProvider() {
      const boolValue = boolContext.useOptionalValue()
      const numValue = numberContext.useOptionalValue()
      const strValue = stringContext.useOptionalValue()
      return (
        <div>
          {boolValue === null && numValue === null && strValue === null
            ? "all-null"
            : "error"}
        </div>
      )
    }

    const container4 = renderComponent(<TestNoProvider />)
    expect(container4.textContent).toBe("all-null")
  })
})

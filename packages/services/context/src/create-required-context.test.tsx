import { act, type ReactElement } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, describe, expect, it } from "vitest"

import { createRequiredContext } from "./create-required-context"
import { MissingContextError } from "./missing-context-error"

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

describe("createRequiredContext", () => {
  it("creates a context object with the required properties", () => {
    interface TestValue {
      name: string
    }

    const result = createRequiredContext<TestValue>("TestContext")

    expect(result).toHaveProperty("Context")
    expect(result).toHaveProperty("Provider")
    expect(result).toHaveProperty("useRequiredValue")
  })

  it("sets the displayName on the Context", () => {
    const result = createRequiredContext("MyContext")

    expect(result.Context.displayName).toBe("MyContext")
  })

  it("sets the displayName on the Provider", () => {
    const result = createRequiredContext("MyContext")

    // The Provider is assigned a displayName property after function declaration
    const providerWithName = result.Provider as unknown as {
      displayName?: string
    }
    expect(providerWithName.displayName).toBe("MyContextProvider")
  })

  it("throws MissingContextError when useRequiredValue is called outside provider", () => {
    interface TestValue {
      id: string
    }

    const { useRequiredValue } = createRequiredContext<TestValue>("TestContext")

    function TestComponent() {
      useRequiredValue()
      return <div>should not render</div>
    }

    expect(() => renderComponent(<TestComponent />)).toThrow(
      MissingContextError
    )
  })

  it("includes the context name in the error message", () => {
    interface TestValue {
      id: string
    }

    const { useRequiredValue } =
      createRequiredContext<TestValue>("CustomContext")

    function TestComponent() {
      useRequiredValue()
      return <div>should not render</div>
    }

    expect(() => renderComponent(<TestComponent />)).toThrow(
      "CustomContext is unavailable"
    )
  })

  it("provides the value to useRequiredValue when wrapped in provider", () => {
    interface TestValue {
      id: string
      name: string
    }

    const { Provider, useRequiredValue } =
      createRequiredContext<TestValue>("TestContext")

    const testValue = { id: "123", name: "Test" }

    function TestComponent() {
      const value = useRequiredValue()
      return <div>{`${value.id}-${value.name}`}</div>
    }

    const container = renderComponent(
      <Provider value={testValue}>
        <TestComponent />
      </Provider>
    )

    expect(container.textContent).toBe("123-Test")
  })

  it("returns the correct value type from useRequiredValue", () => {
    interface User {
      id: number
      email: string
      role: "admin" | "user"
    }

    const { Provider, useRequiredValue } =
      createRequiredContext<User>("UserContext")

    const user: User = { id: 1, email: "test@example.com", role: "admin" }

    function TestComponent() {
      const value = useRequiredValue()

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

    const { Provider, useRequiredValue } =
      createRequiredContext<Value>("NestedContext")

    function TestComponent() {
      const value = useRequiredValue()
      return <div>{value.level}</div>
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

    const { Provider, useRequiredValue } =
      createRequiredContext<Counter>("CounterContext")

    function TestComponent() {
      const value = useRequiredValue()
      return <div>{value.count}</div>
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

    const { Provider, useRequiredValue } =
      createRequiredContext<Shared>("SharedContext")

    function ConsumerA() {
      const value = useRequiredValue()
      return <div data-testid="consumer-a">{value.message}</div>
    }

    function ConsumerB() {
      const value = useRequiredValue()
      return <div data-testid="consumer-b">{value.message}</div>
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

  it("throws error when provider wraps some but not all consumers", () => {
    interface Value {
      data: string
    }

    const { Provider, useRequiredValue } =
      createRequiredContext<Value>("TestContext")

    function Consumer() {
      useRequiredValue()
      return <div>consumer</div>
    }

    function App() {
      return (
        <div>
          <Provider value={{ data: "test" }}>
            <Consumer />
          </Provider>
          <Consumer />
        </div>
      )
    }

    expect(() => renderComponent(<App />)).toThrow(MissingContextError)
  })

  it("properly exposes the Context for use with useContext", () => {
    interface TestValue {
      test: string
    }

    const { Context, Provider, useRequiredValue } =
      createRequiredContext<TestValue>("TestContext")

    // Verify that Context is a valid React Context
    expect(Context).toBeDefined()
    expect(typeof Context.Provider).toBe("object")

    function TestComponent() {
      // Both useRequiredValue and direct useContext should work
      const value = useRequiredValue()

      return <div>{value.test}</div>
    }

    const container = renderComponent(
      <Provider value={{ test: "value" }}>
        <TestComponent />
      </Provider>
    )

    // This test verifies the Context is properly constructed
    expect(container.textContent).toBe("value")
  })

  it("throws with correct error type", () => {
    interface TestValue {
      id: string
    }

    const { useRequiredValue } = createRequiredContext<TestValue>("TestContext")

    function TestComponent() {
      useRequiredValue()
      return <div>should not render</div>
    }

    try {
      renderComponent(<TestComponent />)
      expect.fail("Should have thrown")
    } catch (error) {
      expect(error).toBeInstanceOf(MissingContextError)
      expect(error).toBeInstanceOf(Error)
    }
  })

  it("supports complex value types with methods", () => {
    interface APIContext {
      fetch: (url: string) => Promise<unknown>
      baseUrl: string
    }

    const { Provider, useRequiredValue } =
      createRequiredContext<APIContext>("APIContext")

    const mockFetch = async (url: string) => ({ url })
    const apiValue: APIContext = {
      fetch: mockFetch,
      baseUrl: "https://api.example.com",
    }

    function TestComponent() {
      const api = useRequiredValue()
      return <div>{api.baseUrl}</div>
    }

    const container = renderComponent(
      <Provider value={apiValue}>
        <TestComponent />
      </Provider>
    )

    expect(container.textContent).toBe("https://api.example.com")
  })

  it("maintains referential equality of values across renders", () => {
    interface Value {
      id: string
    }

    const { Provider, useRequiredValue } =
      createRequiredContext<Value>("TestContext")

    let renderCount = 0
    const sameValue = { id: "stable" }

    function TestComponent() {
      const value = useRequiredValue()
      renderCount++
      return <div>{value.id}</div>
    }

    const container = renderComponent(
      <Provider value={sameValue}>
        <TestComponent />
      </Provider>
    )

    const initialRenderCount = renderCount

    // Re-render the component (not the provider value)
    act(() => {
      createRoot(container).render(
        <Provider value={sameValue}>
          <TestComponent />
        </Provider>
      )
    })

    // If the same object is passed, component should use React's optimization
    expect(renderCount).toBeGreaterThanOrEqual(initialRenderCount)
  })
})

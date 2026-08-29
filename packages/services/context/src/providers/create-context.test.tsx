import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"

import { createContext } from "./create-context"

describe("createContext", () => {
  it("creates a context with provider and hook", () => {
    const { Provider, useContext: useTestContext } =
      createContext<string>("TestContext")

    expect(Provider).toBeDefined()
    expect(useTestContext).toBeDefined()
  })

  it("provides value to consumer component", () => {
    const { Provider, useContext: useTestContext } =
      createContext<string>("TestContext")

    const Consumer = () => {
      const value = useTestContext()
      return <div>{value}</div>
    }

    render(
      <Provider value="test-value">
        <Consumer />
      </Provider>
    )

    expect(screen.getByText("test-value")).toBeDefined()
  })

  it("throws error when useContext is called outside provider", () => {
    const { useContext: useTestContext } = createContext<string>("TestContext")

    const Consumer = () => {
      try {
        useTestContext()
        return <div>no error</div>
      } catch (error) {
        if (error instanceof Error && error.name === "ContextError") {
          return <div>{error.message}</div>
        }
        throw error
      }
    }

    render(<Consumer />)

    expect(screen.getByText(/TestContext context not found/)).toBeDefined()
  })

  it("works with complex state objects", () => {
    interface State {
      count: number
      name: string
    }

    const { Provider, useContext: useStateContext } =
      createContext<State>("StateContext")

    const Consumer = () => {
      const state = useStateContext()
      return (
        <div>
          {state.name}: {state.count}
        </div>
      )
    }

    render(
      <Provider value={{ count: 42, name: "answer" }}>
        <Consumer />
      </Provider>
    )

    expect(screen.getByText("answer: 42")).toBeDefined()
  })

  it("supports multiple consumers", () => {
    const { Provider, useContext: useTestContext } =
      createContext<string>("TestContext")

    const Consumer1 = () => {
      const value = useTestContext()
      return <div data-testid="consumer1">{value}</div>
    }

    const Consumer2 = () => {
      const value = useTestContext()
      return <div data-testid="consumer2">{value}</div>
    }

    render(
      <Provider value="shared-value">
        <Consumer1 />
        <Consumer2 />
      </Provider>
    )

    expect(screen.getByTestId("consumer1")).toBeDefined()
    expect(screen.getByTestId("consumer2")).toBeDefined()
  })

  it("sets correct displayName for provider", () => {
    const { Provider } = createContext<string>("AppContext")

    expect((Provider as any).displayName).toBe("AppContextProvider")
  })
})

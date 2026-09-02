import { describe, expect, it } from "vitest"

import { cn } from "./classnames"

describe("cn", () => {
  describe("basic class merging", () => {
    it("merges simple class strings", () => {
      const result = cn("px-2 py-1", "text-sm")
      expect(result).toBe("px-2 py-1 text-sm")
    })

    it("handles single class", () => {
      const result = cn("text-primary")
      expect(result).toBe("text-primary")
    })

    it("handles empty input", () => {
      const result = cn()
      expect(result).toBe("")
    })

    it("ignores null and undefined values", () => {
      const result = cn("px-2", null, "py-1", undefined, "text-sm")
      expect(result).toBe("px-2 py-1 text-sm")
    })

    it("ignores empty strings", () => {
      const result = cn("px-2", "", "py-1")
      expect(result).toBe("px-2 py-1")
    })
  })

  describe("conditional classes with clsx", () => {
    it("applies classes based on condition", () => {
      const isActive = true
      const result = cn("base-class", isActive && "active-class")
      expect(result).toBe("base-class active-class")
    })

    it("skips classes when condition is false", () => {
      const isActive = false
      const result = cn("base-class", isActive && "active-class")
      expect(result).toBe("base-class")
    })

    it("handles multiple conditional classes", () => {
      const isPrimary = true
      const isLarge = false
      const result = cn("button", isPrimary && "bg-primary", isLarge && "h-12")
      expect(result).toBe("button bg-primary")
    })

    it("supports object syntax for conditional classes", () => {
      const result = cn({
        "base-class": true,
        "active-class": true,
        "disabled-class": false,
      })
      expect(result).toBe("base-class active-class")
    })

    it("handles arrays of classes", () => {
      const result = cn(["px-2", "py-1"], "text-sm")
      expect(result).toBe("px-2 py-1 text-sm")
    })
  })

  describe("tailwind conflict resolution", () => {
    it("resolves conflicting padding classes", () => {
      const result = cn("px-2", "px-4")
      expect(result).toBe("px-4")
    })

    it("resolves conflicting margin classes", () => {
      const result = cn("mb-4", "mb-2")
      expect(result).toBe("mb-2")
    })

    it("resolves conflicting background color classes", () => {
      const result = cn("bg-red-500", "bg-blue-500")
      expect(result).toBe("bg-blue-500")
    })

    it("resolves conflicting text color classes", () => {
      const result = cn("text-gray-700", "text-white")
      expect(result).toBe("text-white")
    })

    it("resolves conflicting width classes", () => {
      const result = cn("w-full", "w-1/2")
      expect(result).toBe("w-1/2")
    })

    it("keeps non-conflicting classes together", () => {
      const result = cn("px-4 py-2", "text-white bg-blue-500")
      expect(result).toContain("px-4")
      expect(result).toContain("py-2")
      expect(result).toContain("text-white")
      expect(result).toContain("bg-blue-500")
    })

    it("resolves conflicts while preserving multiple values", () => {
      const result = cn("px-2 py-4", "px-6 py-1 text-sm")
      expect(result).toContain("px-6")
      expect(result).toContain("py-1")
      expect(result).toContain("text-sm")
      expect(result).not.toContain("px-2")
      expect(result).not.toContain("py-4")
    })
  })

  describe("complex scenarios", () => {
    it("combines conditional logic with conflict resolution", () => {
      const isLarge = true
      const result = cn(
        "px-2 py-1",
        isLarge && "px-6 py-4 text-lg",
        "text-gray-700"
      )
      expect(result).toContain("px-6")
      expect(result).toContain("py-4")
      expect(result).toContain("text-lg")
      expect(result).toContain("text-gray-700")
    })

    it("handles responsive classes", () => {
      const result = cn("sm:px-2 md:px-4 lg:px-6", "md:px-8")
      expect(result).toContain("sm:px-2")
      expect(result).toContain("lg:px-6")
      expect(result).toContain("md:px-8")
    })

    it("preserves dark mode classes", () => {
      const result = cn(
        "bg-white dark:bg-slate-900",
        "text-black dark:text-white"
      )
      expect(result).toContain("bg-white")
      expect(result).toContain("dark:bg-slate-900")
      expect(result).toContain("text-black")
      expect(result).toContain("dark:text-white")
    })

    it("handles hover and focus states", () => {
      const result = cn(
        "px-4 py-2 bg-blue-500",
        "hover:bg-blue-600 focus:ring-2"
      )
      expect(result).toContain("px-4")
      expect(result).toContain("py-2")
      expect(result).toContain("bg-blue-500")
      expect(result).toContain("hover:bg-blue-600")
      expect(result).toContain("focus:ring-2")
    })

    it("handles arbitrary values", () => {
      const result = cn("px-[10px] py-[5px]", "w-[calc(100%-20px)]")
      expect(result).toContain("px-[10px]")
      expect(result).toContain("py-[5px]")
      expect(result).toContain("w-[calc(100%-20px)]")
    })

    it("handles complex button variant scenario", () => {
      const variant: string = "primary"
      const size: string = "lg"
      const disabled = false

      const result = cn(
        "inline-flex items-center justify-center rounded transition",
        variant === "primary" && "bg-blue-500 text-white hover:bg-blue-600",
        variant === "secondary" &&
          "bg-gray-200 text-gray-900 hover:bg-gray-300",
        size === "sm" && "px-2 py-1 text-sm",
        size === "lg" && "px-6 py-3 text-lg",
        disabled && "opacity-50 cursor-not-allowed"
      )

      expect(result).toContain("inline-flex")
      expect(result).toContain("items-center")
      expect(result).toContain("rounded")
      expect(result).toContain("transition")
      expect(result).toContain("bg-blue-500")
      expect(result).toContain("text-white")
      expect(result).toContain("hover:bg-blue-600")
      expect(result).toContain("px-6")
      expect(result).toContain("py-3")
      expect(result).toContain("text-lg")
      expect(result).not.toContain("opacity-50")
    })

    it("resolves CSS custom properties", () => {
      const result = cn(
        "[--card-spacing:theme(spacing.4)]",
        "px-[--card-spacing]"
      )
      expect(result).toContain("[--card-spacing:theme(spacing.4)]")
      expect(result).toContain("px-[--card-spacing]")
    })
  })

  describe("edge cases", () => {
    it("handles very long class strings", () => {
      const longClass = "px-1 py-1 " + Array(100).fill("text-sm").join(" ")
      const result = cn(longClass)
      expect(result).toContain("px-1")
      expect(result).toContain("py-1")
    })

    it("handles classes with slashes", () => {
      const result = cn("w-1/2 h-1/3", "w-2/3")
      expect(result).toContain("w-2/3")
      expect(result).toContain("h-1/3")
    })

    it("handles classes with brackets and parens", () => {
      const result = cn(
        "before:content-['*']",
        "after:content-['']",
        "bg-linear-to-r"
      )
      expect(result).toContain("before:content-['*']")
      expect(result).toContain("after:content-['']")
      expect(result).toContain("bg-linear-to-r")
    })

    it("handles negated values", () => {
      const result = cn("-mx-2 -my-4", "-mx-1")
      expect(result).toContain("-mx-1")
      expect(result).toContain("-my-4")
    })

    it("preserves multiple space-separated classes", () => {
      const result = cn("   px-2   py-1   text-sm   ")
      expect(result).toContain("px-2")
      expect(result).toContain("py-1")
      expect(result).toContain("text-sm")
    })
  })

  describe("real world component scenarios", () => {
    it("card component styling", () => {
      const baseCardClasses = "rounded-lg border border-gray-200 bg-white"
      const size: string = "md"
      const variant: string = "elevated"

      const result = cn(
        baseCardClasses,
        size === "sm" && "p-3",
        size === "md" && "p-4",
        size === "lg" && "p-6",
        variant === "flat" && "shadow-none",
        variant === "elevated" && "shadow-md"
      )

      expect(result).toContain("rounded-lg")
      expect(result).toContain("border")
      expect(result).toContain("border-gray-200")
      expect(result).toContain("bg-white")
      expect(result).toContain("p-4")
      expect(result).toContain("shadow-md")
    })

    it("badge component with multiple variants", () => {
      const variant: string = "destructive"
      const size: string = "lg"

      const result = cn(
        "inline-flex items-center rounded-full",
        variant === "default" && "bg-primary text-primary-foreground",
        variant === "secondary" && "bg-secondary text-secondary-foreground",
        variant === "destructive" && "bg-destructive/10 text-destructive",
        variant === "outline" && "border border-input bg-background",
        size === "sm" && "h-5 px-2 text-xs",
        size === "lg" && "h-6 px-3 text-sm"
      )

      expect(result).toContain("inline-flex")
      expect(result).toContain("items-center")
      expect(result).toContain("rounded-full")
      expect(result).toContain("bg-destructive/10")
      expect(result).toContain("text-destructive")
      expect(result).toContain("h-6")
      expect(result).toContain("px-3")
      expect(result).toContain("text-sm")
    })

    it("button with all states", () => {
      const variant: string = "primary"
      const size: string = "md"
      const isDisabled = false
      const isLoading = true
      const customClass = "my-custom-class"

      const result = cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        variant === "primary" &&
          "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "outline" &&
          "border border-input hover:bg-accent hover:text-accent-foreground",
        size === "sm" && "h-8 px-3 text-sm",
        size === "md" && "h-10 px-4",
        size === "lg" && "h-12 px-6",
        isDisabled && "pointer-events-none opacity-50",
        isLoading && "opacity-70",
        customClass
      )

      expect(result).toContain("inline-flex")
      expect(result).toContain("items-center")
      expect(result).toContain("justify-center")
      expect(result).toContain("bg-primary")
      expect(result).toContain("text-primary-foreground")
      expect(result).toContain("h-10")
      expect(result).toContain("px-4")
      expect(result).toContain("opacity-70")
      expect(result).toContain("my-custom-class")
      expect(result).not.toContain("pointer-events-none")
    })
  })
})

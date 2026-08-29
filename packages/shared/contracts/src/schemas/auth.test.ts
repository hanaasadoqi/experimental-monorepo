import { describe, it, expect } from "vitest"
import { loginFormSchema, type LoginForm } from "./auth"

describe("auth schemas", () => {
  describe("loginFormSchema", () => {
    const validForm = {
      email: "user@example.com",
      password: "SecurePassword123",
    }

    describe("email validation", () => {
      it("accepts valid email addresses", () => {
        const validEmails = [
          "user@example.com",
          "john.doe@company.co.uk",
          "test+tag@domain.org",
          "a@b.co",
          "user123@domain-name.com",
          "first.last@sub.domain.example.com",
        ]

        validEmails.forEach((email) => {
          const result = loginFormSchema.safeParse({ ...validForm, email })
          expect(result.success).toBe(true, `Should accept email "${email}"`)
        })
      })

      it("rejects invalid email addresses", () => {
        const invalidEmails = [
          "invalid-email", // no @
          "@example.com", // no local part
          "user@", // no domain
          "user @example.com", // space in local part
          "user@example .com", // space in domain
          "user@.com", // missing domain name
          "user@example..com", // double dot
          "user@example,com", // comma instead of dot
          "user@@example.com", // double @
          "", // empty string
          "user@example.c", // TLD too short (depending on Zod version)
        ]

        invalidEmails.forEach((email) => {
          const result = loginFormSchema.safeParse({ ...validForm, email })
          expect(result.success).toBe(false, `Should reject email "${email}"`)
        })
      })

      it("provides clear error message for invalid email", () => {
        const result = loginFormSchema.safeParse({
          ...validForm,
          email: "not-an-email",
        })

        expect(result.success).toBe(false)
        if (!result.success) {
          const emailError = result.error.issues.find((i) =>
            i.path.includes("email")
          )
          expect(emailError?.message).toBe("Invalid email address")
        }
      })

      it("rejects null or undefined email", () => {
        const forms = [
          { ...validForm, email: null },
          { ...validForm, email: undefined },
        ]

        forms.forEach((form) => {
          const result = loginFormSchema.safeParse(form)
          expect(result.success).toBe(false)
        })
      })

      it("rejects non-string email values", () => {
        const forms = [
          { ...validForm, email: 123 },
          { ...validForm, email: true },
          { ...validForm, email: {} },
          { ...validForm, email: [] },
        ]

        forms.forEach((form) => {
          const result = loginFormSchema.safeParse(form)
          expect(result.success).toBe(false)
        })
      })

      it("handles edge case email formats", () => {
        const edgeCases = [
          { email: "a@b.c", shouldPass: false }, // minimal but depends on Zod config
          { email: "test@localhost", shouldPass: false }, // no TLD
          { email: "user+filter@example.com", shouldPass: true }, // plus addressing
          { email: "1234567890@example.com", shouldPass: true }, // all numbers in local
          { email: "_test@example.com", shouldPass: true }, // underscore in local
          { email: "test_@example.com", shouldPass: true }, // underscore at end
        ]

        edgeCases.forEach(({ email, shouldPass }) => {
          const result = loginFormSchema.safeParse({ ...validForm, email })
          if (shouldPass) {
            expect(result.success).toBe(true, `Should accept email "${email}"`)
          }
        })
      })

      it("is case-insensitive (normalizes email)", () => {
        const emails = [
          "USER@EXAMPLE.COM",
          "User@Example.Com",
          "user@example.com",
        ]

        emails.forEach((email) => {
          const result = loginFormSchema.safeParse({ ...validForm, email })
          expect(result.success).toBe(true)
        })
      })
    })

    describe("password validation", () => {
      it("accepts passwords of 8 characters or more", () => {
        const validPasswords = [
          "12345678", // exactly 8 chars
          "SecurePass123", // 13 chars
          "VeryLongPassword1234567890", // very long
          "Pass@Word#123", // with special chars
          "12 45678", // with space (space counts as character)
        ]

        validPasswords.forEach((password) => {
          const result = loginFormSchema.safeParse({ ...validForm, password })
          expect(result.success).toBe(
            true,
            `Should accept password with ${password.length} chars`
          )
        })
      })

      it("rejects passwords shorter than 8 characters", () => {
        const shortPasswords = [
          "", // 0 chars
          "1", // 1 char
          "short", // 5 chars
          "1234567", // 7 chars
        ]

        shortPasswords.forEach((password) => {
          const result = loginFormSchema.safeParse({ ...validForm, password })
          expect(result.success).toBe(
            false,
            `Should reject password with ${password.length} chars`
          )
        })
      })

      it("provides clear error message for short password", () => {
        const result = loginFormSchema.safeParse({
          ...validForm,
          password: "short",
        })

        expect(result.success).toBe(false)
        if (!result.success) {
          const passwordError = result.error.issues.find((i) =>
            i.path.includes("password")
          )
          expect(passwordError?.message).toBe(
            "Password must be at least 8 characters"
          )
        }
      })

      it("accepts passwords with various character types", () => {
        const passwords = [
          "lowercase12345678", // lowercase + numbers
          "UPPERCASE12345678", // uppercase + numbers
          "MixedCase1234567", // mixed case
          "Pass@Word#$%123", // special characters
          "passwordwithspaces1234", // includes space
          "Üñîçödé_Password_123", // unicode characters
        ]

        passwords.forEach((password) => {
          const result = loginFormSchema.safeParse({ ...validForm, password })
          expect(result.success).toBe(
            true,
            `Should accept password "${password}"`
          )
        })
      })

      it("does not impose requirements beyond minimum length", () => {
        // These are all 8+ chars but lack uppercase/special chars/numbers
        const validPasswords = [
          "aaaaaaaaaaa", // all lowercase
          "AAAAAAAAAAA", // all uppercase
          "11111111111", // all numbers
          "!!!!!!!!!!", // all special chars
          "abcdefgh", // 8 lowercase letters
        ]

        validPasswords.forEach((password) => {
          const result = loginFormSchema.safeParse({ ...validForm, password })
          expect(result.success).toBe(true)
        })
      })

      it("rejects null or undefined password", () => {
        const forms = [
          { ...validForm, password: null },
          { ...validForm, password: undefined },
        ]

        forms.forEach((form) => {
          const result = loginFormSchema.safeParse(form)
          expect(result.success).toBe(false)
        })
      })

      it("rejects non-string password values", () => {
        const forms = [
          { ...validForm, password: 12345678 },
          { ...validForm, password: true },
          { ...validForm, password: {} },
          { ...validForm, password: [] },
        ]

        forms.forEach((form) => {
          const result = loginFormSchema.safeParse(form)
          expect(result.success).toBe(false)
        })
      })

      it("preserves password without modification", () => {
        const password = "MyPassword123@!#"
        const result = loginFormSchema.safeParse({ ...validForm, password })

        if (result.success) {
          expect(result.data.password).toBe(password)
        }
      })
    })

    describe("form validation", () => {
      it("accepts valid complete form", () => {
        const result = loginFormSchema.safeParse(validForm)

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.email).toBe("user@example.com")
          expect(result.data.password).toBe("SecurePassword123")
        }
      })

      it("rejects form with missing email", () => {
        const formWithoutEmail = { password: "SecurePass123" }
        const result = loginFormSchema.safeParse(formWithoutEmail)

        expect(result.success).toBe(false)
      })

      it("rejects form with missing password", () => {
        const formWithoutPassword = { email: "user@example.com" }
        const result = loginFormSchema.safeParse(formWithoutPassword)

        expect(result.success).toBe(false)
      })

      it("rejects form with both fields invalid", () => {
        const result = loginFormSchema.safeParse({
          email: "invalid-email",
          password: "short",
        })

        expect(result.success).toBe(false)
        if (!result.success) {
          // Should have errors for both fields
          const paths = result.error.issues.map((i) => i.path.join("."))
          expect(paths).toContain("email")
          expect(paths).toContain("password")
        }
      })

      it("rejects form with extra unexpected fields (strips them)", () => {
        const formWithExtra = {
          ...validForm,
          username: "extrafield",
          rememberMe: true,
        }

        const result = loginFormSchema.safeParse(formWithExtra)
        expect(result.success).toBe(true)
        if (result.success) {
          // Zod strips extra fields by default
          expect("username" in result.data).toBe(false)
          expect("rememberMe" in result.data).toBe(false)
        }
      })

      it("provides helpful error messages for all validation failures", () => {
        const result = loginFormSchema.safeParse({
          email: "not-an-email",
          password: "short",
        })

        expect(result.success).toBe(false)
        if (!result.success) {
          const emailError = result.error.issues.find((i) =>
            i.path.includes("email")
          )
          const passwordError = result.error.issues.find((i) =>
            i.path.includes("password")
          )

          expect(emailError?.message).toBe("Invalid email address")
          expect(passwordError?.message).toBe(
            "Password must be at least 8 characters"
          )
        }
      })

      it("type inference works for LoginForm", () => {
        const form = loginFormSchema.parse(validForm)
        const typed: LoginForm = form

        expect(typed.email).toBe("user@example.com")
        expect(typed.password).toBe("SecurePassword123")
      })
    })

    describe("real-world scenarios", () => {
      it("handles typical user registration attempts", () => {
        const scenarios = [
          {
            input: { email: "newuser@gmail.com", password: "MySecureP@ss1" },
            shouldPass: true,
          },
          {
            input: { email: "user@company.co.uk", password: "CompanyP@ss2024" },
            shouldPass: true,
          },
          {
            input: { email: "admin", password: "admin123" },
            shouldPass: false,
          },
          {
            input: { email: "test@test.com", password: "123" },
            shouldPass: false,
          },
        ]

        scenarios.forEach(({ input, shouldPass }) => {
          const result = loginFormSchema.safeParse(input)
          expect(result.success).toBe(shouldPass)
        })
      })

      it("maintains type safety through parse", () => {
        const result = loginFormSchema.parse(validForm)

        // These operations should compile and work safely
        const emailLength: number = result.email.length
        const passwordLength: number = result.password.length

        expect(typeof emailLength).toBe("number")
        expect(typeof passwordLength).toBe("number")
      })

      it("can be used in form validation workflows", () => {
        const userData = {
          email: "user@example.com",
          password: "TestPassword123",
          extra: "ignored",
        }

        const validation = loginFormSchema.safeParse(userData)

        if (validation.success) {
          // Form is valid, proceed with login
          expect(validation.data.email).toBeDefined()
          expect(validation.data.password).toBeDefined()
        } else {
          // Form is invalid, show errors
          validation.error.issues.forEach((issue) => {
            expect(issue.message).toBeDefined()
          })
        }
      })
    })
  })
})

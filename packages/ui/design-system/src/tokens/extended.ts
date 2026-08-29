export const radius = {
  borderRadius: {
    DEFAULT: 0,
    semanticVars: {
      DEFAULT: "var(--border-radius-base)",
    },
  },
} as const

export const shadows = {
  boxShadow: {
    DEFAULT: "0px 1px 2px rgba(0, 0, 0, 0.05), 0px 1px 3px rgba(0, 0, 0, 0.1)",
    semanticVars: {
      DEFAULT: "var(--box-shadow-base)",
    },
  },
}

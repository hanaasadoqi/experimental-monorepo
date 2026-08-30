import nextVitals from "eslint-config-next/core-web-vitals"
import nextTypeScript from "eslint-config-next/typescript"
import { reactConfig } from "./react.mjs"

export const nextJsConfig = [...reactConfig, ...nextVitals, ...nextTypeScript]

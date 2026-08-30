import { ThemeForm } from "../schemas/theme.js"
import { DEFAULT_PRIMARY_BASE } from "./colors.js"
import { DEFAULT_APPEARANCE_PREFERENCE } from "./preferences.js"

export const DEFAULT_THEME: ThemeForm = {
  appearance: DEFAULT_APPEARANCE_PREFERENCE,
  primaryColor: DEFAULT_PRIMARY_BASE,
}

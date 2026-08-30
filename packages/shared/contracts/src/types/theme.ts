import type { OklchStr } from "../schemas/colors.js";
import type { ResolvedAppearance } from "./preference.js";

interface ThemeColor {
  oklch: OklchStr
}

interface Theme {
  appearance: ResolvedAppearance;
  primaryColor: ThemeColor | OklchStr;
}

export type {
  ThemeColor,
  Theme
}

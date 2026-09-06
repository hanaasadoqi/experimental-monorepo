# Product Experience Context

This glossary distinguishes saved user intent from the visual result applied by the application. It keeps Preferences, Appearance, and Theme precise as those areas evolve independently.

## Language

**Appearance Preference**:
A user's saved intent to use a light, dark, or system-selected color scheme. It may also be stored as part of a Saved Theme without becoming the active preference.
_Avoid_: Theme mode, dark mode, appearance mode

**Preferences**:
The user's active saved choices that apply across the product. Managed by `@repo/domain-preferences` (types + validation), `@repo/runtime-preferences` (Zustand store), and `@repo/adapters-next` (server cookies). Current types: Appearance, Language, DateFormat, TimeFormat. Appearance + Language persist to server cookies (SSR). DateFormat + TimeFormat stay client-side (localStorage). See `.docs/architecture/preferences-architecture.md`.
_Avoid_: Settings when referring to persisted user choices

**Appearance**:
The currently presented light or dark visual result derived from Appearance Preference and, when selected, the operating-system color scheme.
_Avoid_: Theme

**Resolved Color Scheme**:
The concrete light or dark scheme produced from Appearance Preference and the current operating-system color scheme.
_Avoid_: Resolved theme, effective preference

**Theme**:
A saved visual-language definition, including design values and an Appearance Preference field. Editing a Theme does not change active Preferences.
_Avoid_: Appearance, dark mode

**Apply Theme**:
The explicit action that activates a saved Theme and copies its Appearance Preference into active Preferences. Later preference changes do not mutate the saved Theme.

**Language Preference**:
A user's saved intent to view the product interface in a specific language/locale (e.g., "en", "es", "fr"). Persisted to server cookies for SSR correctness. Set via PreferencesForm.
_Avoid_: Localization, translation

**Date Format Preference**:
A user's saved intent for how dates should be displayed (e.g., "YYYY-MM-DD", "DD/MM/YYYY"). Persisted to client localStorage only (no SSR impact). Set via PreferencesForm.

**Time Format Preference**:
A user's saved intent for how times should be displayed (e.g., "HH:mm", "h:mm A"). Persisted to client localStorage only (no SSR impact). Set via PreferencesForm.

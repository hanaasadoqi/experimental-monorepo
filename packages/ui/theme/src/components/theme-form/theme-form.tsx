"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import {
  Field,
  FieldGroup,
  FieldError,
  FieldLabel,
  FieldDescription,
} from "@repo/ui-components/base/field"
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@repo/ui-components/base/input-group"
import { Button } from "@repo/ui-components/base/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@repo/ui-components/base/select"
import { Slider } from "@repo/ui-components/base/slider"
import {
  RadioGroup,
  RadioGroupItem,
} from "@repo/ui-components/base/radio-group"
import {
  oklchToCss,
  parseOklchString,
  contrastRatio,
  getWCAGLevel,
  DEFAULT_PRIMARY_COLOR,
} from "@repo/domain-theme/colors"
import { getColorHarmonies } from "../../utils/get-color-harmonies"
const RADIUS_OPTIONS = [
  { value: "0", label: "None", style: "0px" },
  { value: "0.25", label: "Small", style: "4px" },
  { value: "0.5", label: "Medium", style: "8px" },
  { value: "1", label: "Large", style: "16px" },
  { value: "1.5", label: "Extra Large", style: "24px" },
] as const

const FONT_OPTIONS = [
  "System",
  "Georgia",
  "Garamond",
  "Inter",
  "Roboto",
  "Monospace",
] as const

export const themeFormSchema = z.object({
  name: z
    .string()
    .min(1, "Theme name is required")
    .max(64, "Theme name must be at most 64 characters"),
  description: z
    .string()
    .max(256, "Description must be at most 256 characters")
    .optional(),
  tags: z.string().optional(),
  primaryColor: z.string(),
  harmonyType: z
    .enum([
      "complementary",
      "analogous",
      "split-complementary",
      "triadic",
      "tetradic",
      "square",
      "rectangle",
      "double-split-complementary",
      "monochromatic",
    ])
    .optional(),
  headingFont: z.enum(FONT_OPTIONS).optional(),
  bodyFont: z.enum(FONT_OPTIONS).optional(),
  monoFont: z.enum(FONT_OPTIONS).optional(),
  fontScale: z.number().min(0.75).max(1.5),
  borderRadius: z.enum(["0", "0.25", "0.5", "1", "1.5"]).optional(),
})

export const ThemeForm = () => {
  const form = useForm<z.infer<typeof themeFormSchema>>({
    resolver: zodResolver(themeFormSchema),
    defaultValues: {
      name: "My Theme",
      description: "",
      tags: "",
      primaryColor: DEFAULT_PRIMARY_COLOR,
      harmonyType: "complementary",
      headingFont: "System",
      bodyFont: "System",
      monoFont: "System",
      fontScale: 1,
      borderRadius: "0.5",
    },
  })

  const primaryColorStr = form.watch("primaryColor")
  const harmonyType = form.watch("harmonyType")
  const fontScale = form.watch("fontScale")
  const borderRadius = form.watch("borderRadius")

  const primaryColor = parseOklchString(primaryColorStr)
  const harmonies = primaryColor ? getColorHarmonies(primaryColor) : []
  const wcagLevel = primaryColor
    ? getWCAGLevel(contrastRatio(oklchToCss(primaryColor), "oklch(95% 0 0)"))
    : undefined

  function onSubmit(data: z.infer<typeof themeFormSchema>) {
    toast("Theme configuration saved:", {
      description: (
        <pre className="mt-2 w-[320px] overflow-x-auto rounded-md bg-code p-4 text-code-foreground text-xs">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
      position: "bottom-right",
    })
  }

  return (
    <div className="space-y-6">
      <form id="form-theme" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup className="gap-6 pb-24">
          <div className="border-border/70 flex items-center gap-3 border-b pb-2">
            <span className="bg-primary size-1.5 rounded-full" />
            <span className="text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase">
              Identity
            </span>
          </div>
          {/* Name */}
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="theme-name">Theme Name</FieldLabel>
                <InputGroupInput
                  {...field}
                  id="theme-name"
                  aria-invalid={fieldState.invalid}
                  placeholder="My Theme"
                  maxLength={64}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Description */}
          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="theme-description">Description</FieldLabel>
                <InputGroup>
                  <InputGroupTextarea
                    {...field}
                    id="theme-description"
                    placeholder="Describe your theme..."
                    rows={3}
                    className="min-h-20 resize-none"
                    maxLength={256}
                  />
                  <InputGroupAddon align="block-end">
                    <InputGroupText className="tabular-nums text-xs">
                      {field.value?.length || 0}/256
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
              </Field>
            )}
          />

          {/* Tags */}
          <Controller
            name="tags"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="theme-tags">Tags</FieldLabel>
                <InputGroupInput
                  {...field}
                  id="theme-tags"
                  placeholder="modern, minimal, dark"
                />
                <FieldDescription>
                  Comma-separated tags for organization
                </FieldDescription>
              </Field>
            )}
          />

          {/* Primary Color Picker */}
          <Field>
            <FieldLabel>Primary Color</FieldLabel>
            <div className="bg-muted/30 border-border/70 rounded-xl border p-3">
              <div className="grid grid-cols-[56px_minmax(0,1fr)] items-center gap-3">
                {primaryColor && (
                  <div
                    className="h-14 w-14 justify-self-start rounded-lg border border-foreground/20 shadow-inner"
                    style={{
                      width: "3.5rem",
                      height: "3.5rem",
                      backgroundColor: oklchToCss(primaryColor),
                      backgroundImage: `linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.18) 50%)`,
                    }}
                    aria-label="Primary color swatch"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <Controller
                    name="primaryColor"
                    control={form.control}
                    render={({ field }) => (
                      <InputGroupInput
                        {...field}
                        type="text"
                        className="bg-background/70 font-mono text-xs"
                        placeholder="oklch(70% 0.14 180)"
                      />
                    )}
                  />
                  <div className="text-muted-foreground mt-2 flex items-center justify-between gap-2 text-[11px]">
                    <span className="font-mono truncate">
                      {primaryColorStr}
                    </span>
                    <span className="shrink-0 font-medium">
                      {wcagLevel ? `WCAG ${wcagLevel}` : "Invalid color"}
                      {primaryColor &&
                        ` · ${contrastRatio(oklchToCss(primaryColor), "oklch(95% 0 0)").toFixed(2)}:1`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Field>

          {/* Color Harmony */}
          {harmonies.length > 0 && (
            <Field className="gap-3">
              <FieldLabel>Color Harmony Type</FieldLabel>
              <FieldDescription>
                Select a harmony pattern for accent color options
              </FieldDescription>
              <div className="mt-1 grid max-h-72 grid-cols-2 gap-2 overflow-y-auto pr-1">
                {harmonies.map((harmony) => (
                  <button
                    key={harmony.type}
                    type="button"
                    onClick={() => form.setValue("harmonyType", harmony.type)}
                    className={`relative flex min-h-24 w-full flex-col items-start justify-between gap-2 rounded-xl border p-2.5 text-left transition-all ${
                      harmonyType === harmony.type
                        ? "border-primary/60 bg-primary/5"
                        : "border-border hover:border-border/80"
                    }`}
                  >
                    <div className="flex gap-1.5 shrink-0">
                      {harmony.colors.slice(0, 4).map((c, i) => (
                        <div
                          key={i}
                          className="size-4 rounded-full border border-white/20 shadow-sm"
                          style={{ backgroundColor: oklchToCss(c) }}
                        />
                      ))}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{harmony.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {harmony.description}
                      </p>
                    </div>
                    {harmonyType === harmony.type && (
                      <div className="size-2 rounded-full bg-primary shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </Field>
          )}

          {/* Typography */}
          <div className="border-border/70 flex items-center gap-3 border-b pb-2 pt-1">
            <span className="bg-primary size-1.5 rounded-full" />
            <span className="text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase">
              Typography
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Controller
              name="headingFont"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="heading-font" className="text-xs">
                    Heading
                  </FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="heading-font" size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {FONT_OPTIONS.map((font) => (
                          <SelectItem key={font} value={font}>
                            {font}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
            <Controller
              name="bodyFont"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="body-font" className="text-xs">
                    Body
                  </FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="body-font" size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {FONT_OPTIONS.map((font) => (
                          <SelectItem key={font} value={font}>
                            {font}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
            <Controller
              name="monoFont"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor="mono-font" className="text-xs">
                    Mono
                  </FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="mono-font" size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {FONT_OPTIONS.map((font) => (
                          <SelectItem key={font} value={font}>
                            {font}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </div>

          {/* Font Scale */}
          <Controller
            name="fontScale"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Font Scale</FieldLabel>
                <FieldDescription className="mb-2">
                  {(fontScale * 100).toFixed(0)}%
                </FieldDescription>
                <Slider
                  value={[fontScale]}
                  onValueChange={(v) =>
                    field.onChange(Array.isArray(v) ? v[0] : v)
                  }
                  min={0.75}
                  max={1.5}
                  step={0.05}
                  className="w-full"
                />
              </Field>
            )}
          />

          {/* Shape */}
          <div className="border-border/70 flex items-center gap-3 border-b pb-2 pt-1">
            <span className="bg-primary size-1.5 rounded-full" />
            <span className="text-muted-foreground text-[10px] font-semibold tracking-[0.16em] uppercase">
              Shape
            </span>
          </div>
          {/* Border Radius */}
          <Controller
            name="borderRadius"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Border Radius</FieldLabel>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="grid grid-cols-5 gap-2 mt-3"
                >
                  {RADIUS_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className={`flex flex-col items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                        field.value === option.value
                          ? "border-primary/60 bg-primary/5"
                          : "border-border hover:border-border/80"
                      }`}
                    >
                      <div
                        className="size-8 border-2 border-primary/40"
                        style={{ borderRadius: option.style }}
                      />
                      <RadioGroupItem
                        value={option.value}
                        className="sr-only"
                      />
                      <span className="text-xs text-center font-medium">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </RadioGroup>
              </Field>
            )}
          />
        </FieldGroup>
      </form>

      <Field
        orientation="horizontal"
        className="bg-background/95 border-border sticky bottom-0 z-10 -mx-4 gap-2 border-t px-4 pt-4 pb-1 backdrop-blur"
      >
        <Button type="button" variant="outline" onClick={() => form.reset()}>
          Reset
        </Button>
        <Button type="submit" form="form-theme" className="flex-1">
          Save Theme
        </Button>
      </Field>
    </div>
  )
}

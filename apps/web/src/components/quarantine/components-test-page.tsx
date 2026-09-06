"use client"

const initialPrimary = {
  l: 0.55,
  c: 0.15,
  h: 250,
}

const initialAccent = {
  l: 0.55,
  c: 0.15,
  h: 30,
}
export default function ComponentsTestPage() {
  const defaultPrimaryColor = useOklchColor(initialPrimary)
  const {
    color: primaryColor,
    setColor: setPrimaryColor,
    css: primaryString,
    hex: primaryHex,
  } = defaultPrimaryColor
  const { color: accentColor, setColor: setAccentColor } =
    useOklchColor(initialAccent)

  const shades = generateShadeScale({ color: primaryColor, anchorShade: 500 })
  const accentShades = accentColor
    ? generateShadeScale({ color: accentColor, anchorShade: 500 })
    : []

  return (
    <div className="bg-background min-h-screen p-8">
      <div className="mx-auto max-w-7xl space-y-12">
        <div>
          <h1 className="mb-2 text-3xl font-bold">Display Components</h1>
          <p className="text-muted-foreground">
            Rendered separately for composition
          </p>
        </div>

        {/* OklchSliders */}
        <section className="bg-card border-border rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-semibold">OklchSliders</h2>
          <OklchSliders color={primaryColor} onChange={setPrimaryColor} />
        </section>

        {/* HuePresetGrid */}
        <section className="bg-card border-border rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-semibold">HuePresetGrid</h2>
          <HuePresetGrid color={primaryColor} onColorSelect={setPrimaryColor} />
        </section>

        {/* ContrastIndicator */}
        <section className="bg-card border-border rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-semibold">ContrastIndicator</h2>
          <ContrastIndicator color={primaryColor} />
        </section>

        {/* HarmonyPicker */}
        <section className="bg-card border-border rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-semibold">HarmonyPicker</h2>
          <HarmonyPicker
            primaryColor={primaryColor}
            accentColor={accentColor}
            onAccentColorChange={setAccentColor}
            onAccentClear={() => setAccentColor(initialAccent)}
          />
        </section>

        <section className="bg-card border-border rounded-lg border p-6">
          <div className="flex w-full items-center justify-between">
            <h2 className="mb-4 text-lg font-semibold">ColorScalePreview</h2>
            <ColorFormatSelect />
          </div>
          <div className="flex flex-col gap-4">
            <Popover>
              <PopoverTrigger
                render={
                  <ColorSwatchTrigger hex={primaryHex} css={primaryString} />
                }
              />
              <PopoverContent className="min-w-80">
                <ScrollArea
                  className="h-80 w-full rounded-md border p-4"
                  dir={"vertical"}
                >
                  <TabsColorPicker defaultColor={primaryColor} />
                </ScrollArea>
              </PopoverContent>
            </Popover>

            <ShadeRamp shades={shades} />
            <ShadeRamp shades={accentShades} />
          </div>
        </section>
      </div>
    </div>
  )
}

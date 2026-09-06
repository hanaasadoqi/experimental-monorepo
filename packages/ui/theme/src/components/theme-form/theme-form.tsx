"use client"
import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { Field, FieldGroup, FieldError, FieldLabel } from "@repo/ui-components/base/field";
import { InputGroup, InputGroupInput, InputGroupAddon, InputGroupText, InputGroupTextarea } from "@repo/ui-components/base/input-group";
import { Button } from "@repo/ui-components/base/button";



export const themeFormSchema = z.object({
  title: z
    .string()
    .min(5, "Bug title must be at least 2 characters.")
    .max(32, "Bug title must be at most 20 characters."),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters.")
    .max(100, "Description must be at most 100 characters."),
})

export const ThemeForm = () => {
  const themeForm = useForm<z.infer<typeof themeFormSchema>>({
    resolver: zodResolver(themeFormSchema),
    defaultValues: {
      title: "Untitled",
      description: "",
    },
  })
  function onSubmit(data: z.infer<typeof themeFormSchema>) {
    toast("You submitted the following values:", {
      description: (
        <pre className="mt-2 w-[320px] overflow-x-auto rounded-md bg-code p-4 text-code-foreground">
          <code>{JSON.stringify(data, null, 2)}</code>
        </pre>
      ),
      position: "bottom-right",
      classNames: {
        content: "flex flex-col gap-2",
      },
      style: {
        "--border-radius": "calc(var(--radius)  + 4px)",
      } as React.CSSProperties,
    })
  }

  return (
    <div className="space-y-6">
      <form id="form-theme-form" onSubmit={themeForm.handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            name="title"
            control={themeForm.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-theme-title">
                  Theme title
                </FieldLabel>
                <InputGroupInput
                  {...field}
                  id="form-theme-title"
                  aria-invalid={fieldState.invalid}
                  placeholder="Untitled Theme"
                  min={2}
                  max={20}
                  defaultValue={"Untitled"}
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="description"
            control={themeForm.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="form-theme-description">
                  Description
                </FieldLabel>
                <InputGroup>
                  <InputGroupTextarea
                    {...field}
                    id="form-theme-description"
                    placeholder="Describe your theme..."
                    rows={6}
                    className="min-h-24 resize-none"
                    required={false}
                    maxLength={100}
                    autoComplete="off"
                    aria-invalid={fieldState.invalid}
                  />
                  <InputGroupAddon align="block-end">
                    <InputGroupText className="tabular-nums">
                      {field.value.length}/100 characters
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </form>
      <Field orientation="horizontal">
        <Button type="button" variant="outline" onClick={() => themeForm.reset()}>
          Reset
        </Button>
        <Button type="submit" form="form-theme-form">
          Submit
        </Button>
      </Field>
    </div>
  );
};

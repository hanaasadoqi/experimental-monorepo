import { Button } from "@repo/ui-components/base/button"
import {
  Card,
  CardHeader,
  CardFooter,
  CardContent,
  CardTitle,
  CardDescription,
  CardAction,
} from "@repo/ui-components/base/card"

export default function Page() {
  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              This is some content inside the card. It can be any React
              component or HTML element.
            </p>
          </CardContent>
          <CardFooter>
            <CardAction>
              <Button>Click Me</Button>
            </CardAction>
          </CardFooter>
        </Card>
        ``
      </div>
    </div>
  )
}

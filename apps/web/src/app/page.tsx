import {
  ArrowUpRight01Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Folder02Icon,
  InboxIcon,
  MoreHorizontalIcon,
  PlusSignIcon,
  Search01Icon,
  SparklesIcon,
  Task01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Button } from "@repo/ui-components/base/button"
import { Input } from "@repo/ui-components/base/input"
import { Badge } from "@repo/ui-components/base/badge"

const projects = [
  {
    name: "Website refresh",
    detail: "Design system migration",
    color: "bg-primary",
  },
  {
    name: "Q4 planning",
    detail: "Strategy and priorities",
    color: "bg-accent",
  },
  { name: "Mobile app", detail: "Product delivery", color: "bg-info" },
]

const tasks = [
  {
    title: "Review navigation exploration",
    project: "Website refresh",
    due: "Today",
    priority: "High",
  },
  {
    title: "Share the launch brief",
    project: "Q4 planning",
    due: "Tomorrow",
    priority: "Medium",
  },
  {
    title: "Clarify offline states",
    project: "Mobile app",
    due: "Friday",
    priority: "Low",
  },
]

export default function Page() {
  return (
    <main className="flex flex-1 flex-col gap-8 px-5 py-6 md:px-8 md:py-8">
      <section className="border-border flex flex-col gap-6 border-b pb-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-3">
          <p className="text-muted-foreground text-sm">Monday, September 7</p>
          <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-balance md:text-4xl">
            Make space for the work that matters.
          </h1>
          <p className="text-muted-foreground max-w-xl text-base leading-6">
            A clear view of your projects, priorities, and the small things
            waiting for your attention.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <HugeiconsIcon icon={Search01Icon} data-icon="inline-start" />
            Search
            <span className="text-muted-foreground ml-2 hidden text-xs sm:inline">
              ⌘ K
            </span>
          </Button>
          <Button size="sm">
            <HugeiconsIcon icon={PlusSignIcon} data-icon="inline-start" />
            New task
          </Button>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(18rem,0.8fr)]">
        <div className="border-border bg-card flex flex-col gap-5 rounded-xl border p-5 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={SparklesIcon} className="text-primary" />
                <h2 className="text-lg font-semibold">Your focus</h2>
              </div>
              <p className="text-muted-foreground text-sm">
                Three things that will move the week forward.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="More focus options"
            >
              <HugeiconsIcon icon={MoreHorizontalIcon} />
            </Button>
          </div>
          <div className="divide-border flex flex-col divide-y">
            {tasks.map((task) => (
              <div
                className="flex items-center gap-3 py-4 first:pt-1 last:pb-1"
                key={task.title}
              >
                <button
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label={`Complete ${task.title}`}
                >
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} />
                </button>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span className="truncate text-sm font-medium">
                    {task.title}
                  </span>
                  <span className="text-muted-foreground truncate text-xs">
                    {task.project}
                  </span>
                </div>
                <div className="text-muted-foreground hidden items-center gap-3 text-xs sm:flex">
                  <Badge
                    variant={task.priority === "High" ? "default" : "secondary"}
                  >
                    {task.priority}
                  </Badge>
                  <span>{task.due}</span>
                </div>
                <HugeiconsIcon
                  icon={ArrowUpRight01Icon}
                  className="text-muted-foreground"
                />
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground justify-start px-0 hover:bg-transparent"
          >
            View all tasks
            <HugeiconsIcon icon={ArrowUpRight01Icon} data-icon="inline-end" />
          </Button>
        </div>

        <div className="border-border bg-muted/40 flex flex-col gap-5 rounded-xl border p-5 md:p-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-lg font-semibold">Quick capture</h2>
            <p className="text-muted-foreground text-sm">
              Get it out of your head. Sort it later.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Input
              placeholder="What needs your attention?"
              aria-label="Capture a new task"
            />
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground text-xs">
                Press Enter to save
              </span>
              <Button size="sm">Capture</Button>
            </div>
          </div>
          <div className="border-border text-muted-foreground flex items-center gap-2 border-t pt-4 text-xs">
            <HugeiconsIcon icon={InboxIcon} />
            <span>4 unsorted items</span>
            <Button variant="link" size="sm" className="ml-auto h-auto p-0">
              Review
            </Button>
          </div>
        </div>
      </section>

      <section className="border-border grid gap-8 border-t pt-8 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.55fr)]">
        <div className="flex flex-col gap-5">
          <div className="flex items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold">Active projects</h2>
              <p className="text-muted-foreground text-sm">
                A quick pulse across your workspace.
              </p>
            </div>
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {projects.map((project) => (
              <a
                className="group border-border bg-background hover:border-primary/50 hover:bg-muted/40 flex min-h-32 flex-col justify-between rounded-lg border p-4 transition-colors"
                href="#"
                key={project.name}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className={`size-2.5 rounded-full ${project.color}`} />
                  <HugeiconsIcon
                    icon={ArrowUpRight01Icon}
                    className="text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-sm font-medium">{project.name}</h3>
                  <p className="text-muted-foreground text-xs">
                    {project.detail}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="lg:border-border flex flex-col gap-5 lg:border-l lg:pl-8">
          <div className="flex items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold">Coming up</h2>
              <p className="text-muted-foreground text-sm">
                Your next few moments.
              </p>
            </div>
            <HugeiconsIcon
              icon={Calendar03Icon}
              className="text-muted-foreground"
            />
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 text-primary mt-1 flex size-8 shrink-0 items-center justify-center rounded-md">
                <HugeiconsIcon icon={UserGroupIcon} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">Team sync</span>
                <span className="text-muted-foreground text-xs">
                  Today, 2:00 PM
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-accent/15 text-accent-foreground mt-1 flex size-8 shrink-0 items-center justify-center rounded-md">
                <HugeiconsIcon icon={Folder02Icon} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">Planning review</span>
                <span className="text-muted-foreground text-xs">
                  Tomorrow, 10:30 AM
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-muted text-muted-foreground mt-1 flex size-8 shrink-0 items-center justify-center rounded-md">
                <HugeiconsIcon icon={Clock01Icon} />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium">Weekly reset</span>
                <span className="text-muted-foreground text-xs">
                  Friday, 4:00 PM
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-primary/20 bg-primary/5 flex flex-col gap-4 rounded-xl border p-5 md:flex-row md:items-center md:justify-between md:p-6">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-lg">
            <HugeiconsIcon icon={Task01Icon} />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-semibold">Your workspace is taking shape.</h2>
            <p className="text-muted-foreground text-sm">
              Invite your team to make planning a shared habit.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm">
          Invite teammates
        </Button>
      </section>
    </main>
  )
}

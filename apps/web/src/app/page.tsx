import { ScopeDemo } from "../components/scope-demo"

export default function Page() {
  return (
    <main className="grid min-h-svh gap-8 p-6 lg:grid-cols-[minmax(0,24rem)_minmax(0,40rem)]">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Theme System Demo</h1>
        <ScopeDemo />
      </div>
    </main>
  )
}

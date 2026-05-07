import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <section className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400">
          Welcome
        </p>
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Mc Seanlibee</h1>
        <p className="max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
          A focused platform for building and shipping reliable products with clear workflows.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="flex flex-col gap-2">
          <CardTitle>Fast Delivery</CardTitle>
          <CardDescription>Move from idea to production quickly with a lightweight, practical stack.</CardDescription>
        </Card>
        <Card className="flex flex-col gap-2">
          <CardTitle>Reliable Quality</CardTitle>
          <CardDescription>Ship with confidence using clear standards and repeatable verification.</CardDescription>
        </Card>
        <Card className="flex flex-col gap-2">
          <CardTitle>Scalable Foundation</CardTitle>
          <CardDescription>Grow features on a clean structure designed for long-term maintainability.</CardDescription>
        </Card>
      </div>
    </div>
  );
}

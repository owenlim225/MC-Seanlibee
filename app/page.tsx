import Image from "next/image";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex flex-col gap-8">
      <section className="space-y-4">
        <div className="relative w-full overflow-hidden rounded-xl border border-[var(--border-default)] bg-white shadow-sm">
          <div className="relative aspect-[16/7] w-full">
            <Image
              src="https://sdgpxydkqdthgolfmpei.supabase.co/storage/v1/object/public/website-assets/banner.jpg"
              alt="Assorted dishes prepared by MC Seanlibee kitchen team"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 1152px"
            />
          </div>
        </div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[var(--text-muted)]">Welcome</p>
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Mc Seanlibee</h1>
        <p className="max-w-2xl text-base text-[var(--text-muted)]">
          Fresh meals, reliable delivery, and a seamless ordering experience built for busy days.
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

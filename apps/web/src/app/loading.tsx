import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <main className="min-h-dvh bg-background px-5 py-8">
      <section className="mx-auto w-full max-w-6xl space-y-5">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-12 w-full max-w-xl" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      </section>
    </main>
  );
}

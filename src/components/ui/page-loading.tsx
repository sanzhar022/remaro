import { Skeleton } from "@/components/ui/skeleton";
import { Section } from "@/components/ui/section";

export function PageLoading() {
  return (
    <Section aria-label="Загрузка страницы">
      <Skeleton className="h-4 w-48" />
      <Skeleton className="mt-7 h-11 w-2/3 max-w-xl" />
      <Skeleton className="mt-4 h-5 w-full max-w-2xl" />
      <div className="mt-10 grid gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
        <Skeleton className="hidden h-[34rem] lg:block" />
        <div className="grid min-w-0 grid-cols-1 gap-3 min-[375px]:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => <Skeleton key={index} className="aspect-[3/5] min-h-80" />)}
        </div>
      </div>
    </Section>
  );
}

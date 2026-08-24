import { Skeleton } from "@/components/ui/skeleton";
import { Section } from "@/components/ui/section";
export function PageLoading() { return <Section><Skeleton className="h-10 w-2/3 max-w-xl" /><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-72" />)}</div></Section>; }

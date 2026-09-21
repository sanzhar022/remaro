import {redirect} from "next/navigation";
import {AccountNav} from "@/components/account/account-nav";
import {Section} from "@/components/ui/section";
import {auth} from "@/lib/auth";

export default async function AccountLayout({children}:{children:React.ReactNode}){const session=await auth();if(!session?.user?.id)redirect("/login");return <Section><div className="grid min-w-0 gap-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start"><aside className="rounded-[var(--radius-lg)] bg-[var(--navy-900)] p-3 text-white lg:sticky lg:top-5"><p className="px-3 py-2 text-xs font-semibold uppercase tracking-[.16em] text-white/45">Личный кабинет</p><AccountNav/></aside><main className="min-w-0">{children}</main></div></Section>}

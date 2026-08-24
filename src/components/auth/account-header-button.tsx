import { LogIn, ShieldCheck, UserRound } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";

export async function AccountHeaderButton() {
  const session = await auth();
  const authenticated = Boolean(session?.user);
  const label = authenticated ? session?.user?.name || "Профиль" : "Войти";
  const Icon = authenticated ? UserRound : LogIn;

  const className = "flex min-h-11 min-w-11 max-w-24 flex-col items-center justify-center gap-0.5 rounded-[var(--radius-md)] px-2 text-[11px] text-muted transition-colors hover:bg-secondary hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/25";
  return (<>
    {session?.user?.role === "ADMIN" && <Link href="/admin" title="Админ" aria-label="Админ" className={className}><ShieldCheck size={21} aria-hidden="true"/><span className="hidden xl:block">Админ</span></Link>}
    <Link href={authenticated ? "/account" : "/login"} title={label} aria-label={label} className={className}>
      <Icon size={21} aria-hidden="true" /><span className="hidden max-w-full truncate xl:block">{label}</span>
    </Link>
  </>);
}

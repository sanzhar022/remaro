"use client";

import {Heart,LogOut,Package,UserRound} from "lucide-react";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {signOut} from "next-auth/react";

const links=[["/account","Мой профиль",UserRound],["/account/orders","Мои заказы",Package],["/favorites","Избранное",Heart]] as const;
export function AccountNav(){const pathname=usePathname();return <nav aria-label="Личный кабинет" className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">{links.map(([href,label,Icon])=>{const active=href==="/account"?pathname===href:pathname.startsWith(href);return <Link key={href} href={href} aria-current={active?"page":undefined} className={`inline-flex min-h-11 shrink-0 items-center gap-3 rounded-md px-3 text-sm font-semibold transition ${active?"bg-primary text-[var(--navy-950)]":"text-white/85 hover:bg-white/10 hover:text-primary"}`}><Icon size={18} aria-hidden="true"/>{label}</Link>})}<button type="button" onClick={()=>void signOut({callbackUrl:"/"})} className="inline-flex min-h-11 shrink-0 items-center gap-3 rounded-md px-3 text-sm font-semibold text-white/85 transition hover:bg-white/10 hover:text-primary"><LogOut size={18} aria-hidden="true"/>Выйти</button></nav>}

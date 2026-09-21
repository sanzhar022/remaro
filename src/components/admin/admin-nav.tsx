"use client";

import { Boxes, FolderTree, LayoutDashboard, Menu, PackageCheck, Settings, Store, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const links=[["/admin","Обзор",LayoutDashboard],["/admin/products","Товары",Boxes],["/admin/categories","Категории",FolderTree],["/admin/orders","Заказы",PackageCheck],["/admin/settings","Управление сайтом",Settings],["/","На сайт",Store]] as const;

export function AdminNav({className=""}:{className?:string}) {
  const pathname=usePathname();
  return <nav aria-label="Панель управления" className={`flex gap-2 ${className}`}>{links.map(([href,label,Icon])=>{const active=href==="/admin"?pathname===href:href!=="/"&&pathname.startsWith(href);return <Link key={href} href={href} aria-current={active?"page":undefined} className={`inline-flex min-h-11 items-center gap-3 rounded-md border px-3 text-sm font-semibold transition ${active?"border-primary bg-primary text-[var(--navy-950)]":"border-border/20 bg-white/5 text-inherit hover:border-primary hover:bg-primary/10 hover:text-primary"}`}><Icon size={18} aria-hidden="true"/>{label}</Link>})}</nav>;
}

export function AdminMobileNav() {
  const [open,setOpen]=useState(false);
  useEffect(()=>{if(!open)return;const close=(event:KeyboardEvent)=>{if(event.key==="Escape")setOpen(false)};window.addEventListener("keydown",close);return()=>window.removeEventListener("keydown",close)},[open]);
  return <><button type="button" onClick={()=>setOpen(true)} aria-expanded={open} aria-controls="admin-mobile-menu" className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-3 font-semibold"><Menu size={20} aria-hidden="true"/>Меню</button>{open&&<div className="fixed inset-0 z-50 bg-black/45" role="presentation" onMouseDown={()=>setOpen(false)}><section id="admin-mobile-menu" role="dialog" aria-modal="true" aria-label="Навигация администратора" className="h-full w-[min(20rem,88vw)] bg-[var(--navy-900)] p-5 text-white shadow-xl" onClick={event=>{if((event.target as HTMLElement).closest("a"))setOpen(false)}} onMouseDown={event=>event.stopPropagation()}><div className="flex items-center justify-between"><strong>Remaro Admin</strong><button type="button" autoFocus onClick={()=>setOpen(false)} aria-label="Закрыть меню" className="grid size-11 place-items-center rounded-md hover:bg-white/10"><X aria-hidden="true"/></button></div><AdminNav className="mt-6 flex-col"/></section></div>}</>;
}

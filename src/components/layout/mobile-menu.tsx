"use client";

import { Heart, Menu, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export interface MobileMenuProps {
  links: ReadonlyArray<{ href: string; label: string }>;
}

export function MobileMenu({ links }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
    } else if (!open && dialog.open) {
      dialog.close();
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    document.body.style.overflow = "";
    requestAnimationFrame(() => triggerRef.current?.focus());
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Открыть меню"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="grid size-11 place-items-center rounded-md border border-white/15 text-white transition-colors hover:border-primary hover:text-primary"
      >
        <Menu size={21} aria-hidden="true" />
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="mobile-menu-title"
        onCancel={(event) => { event.preventDefault(); close(); }}
        onClose={() => setOpen(false)}
        onClick={(event) => { if (event.target === event.currentTarget) close(); }}
        className="fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 backdrop:bg-[var(--navy-950)]/60 lg:hidden"
      >
        <div className="ml-auto flex h-full w-[min(21rem,88vw)] flex-col bg-white text-[var(--navy-900)] shadow-[var(--shadow-md)]">
          <header className="flex min-h-16 items-center justify-between border-b border-border px-4">
            <h2 id="mobile-menu-title" className="font-bold">Меню</h2>
            <button type="button" autoFocus onClick={close} aria-label="Закрыть меню" className="grid size-11 place-items-center rounded-md hover:bg-secondary">
              <X size={22} aria-hidden="true" />
            </button>
          </header>
          <nav aria-label="Мобильное меню" className="min-h-0 flex-1 overflow-y-auto p-3">
            {links.map((link) => (
              <Link key={link.href} href={link.href} onClick={close} className="flex min-h-12 items-center rounded-md px-3 text-sm font-semibold hover:bg-secondary focus-visible:bg-secondary">
                {link.label}
              </Link>
            ))}
            <div className="my-2 border-t border-border" />
            <Link href="/favorites" onClick={close} className="flex min-h-12 items-center gap-3 rounded-md px-3 text-sm font-semibold hover:bg-secondary focus-visible:bg-secondary"><Heart size={19} aria-hidden="true" />Избранное</Link>
            <Link href="/account" onClick={close} className="flex min-h-12 items-center gap-3 rounded-md px-3 text-sm font-semibold hover:bg-secondary focus-visible:bg-secondary"><UserRound size={19} aria-hidden="true" />Профиль</Link>
          </nav>
        </div>
      </dialog>
    </>
  );
}

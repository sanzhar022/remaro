"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type DeleteResponse = { error?: string; message?: string };
export type AdminCategoryRow = { id: string; name: string; slug: string; parentName: string | null; order: number; products: number; children: number; depth: number };

export function AdminCategoriesTable({ rows }: { rows: AdminCategoryRow[] }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [category, setCategory] = useState<{ id: string; name: string } | null>(null);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  function openDialog(row: AdminCategoryRow) {
    setNotice(null);
    setCategory({ id: row.id, name: row.name });
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    if (!pending) dialogRef.current?.close();
  }

  async function remove() {
    if (pending || !category?.id) return;
    setPending(true);
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/categories/${encodeURIComponent(category.id)}`, { method: "DELETE" });
      const data = await response.json().catch(() => ({})) as DeleteResponse;
      if (!response.ok) throw new Error(data.error || "Не удалось удалить категорию.");
      dialogRef.current?.close();
      setNotice({ type: "success", text: data.message || "Категория удалена" });
      router.refresh();
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "Не удалось удалить категорию." });
    } finally {
      setPending(false);
    }
  }

  return <>
    <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full min-w-[48rem] text-left text-sm">
        <thead><tr className="bg-secondary"><th className="p-3">Название</th><th>Slug</th><th>Родитель</th><th>Порядок</th><th>Товары</th><th>Дочерние</th><th></th></tr></thead>
        <tbody>{rows.map((row) => <tr key={row.id} className="border-t border-border">
          <td className="p-3 font-semibold"><span style={{ paddingLeft: `${row.depth * 1.25}rem` }}>{row.depth > 0 && <span aria-hidden="true">└ </span>}{row.name}</span></td>
          <td>{row.slug}</td><td>{row.parentName ?? "—"}</td><td>{row.order}</td><td>{row.products}</td><td>{row.children}</td>
          <td><div className="flex items-center gap-3 whitespace-nowrap"><Link href={`/admin/categories/${row.id}/edit`} className="font-semibold text-primary underline">Редактировать</Link><span className="text-border" aria-hidden="true">|</span><button type="button" onClick={() => openDialog(row)} className="inline-flex items-center gap-1 font-semibold text-destructive transition-colors hover:text-[#a92b2b] hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-destructive/20" aria-haspopup="dialog"><Trash2 size={15} aria-hidden="true" />Удалить</button></div></td>
        </tr>)}</tbody>
      </table>
    </div>
    <dialog ref={dialogRef} onCancel={(event) => { if (pending) event.preventDefault(); }} onClick={(event) => { if (event.target === event.currentTarget) closeDialog(); }} className="m-auto w-[min(30rem,calc(100%-2rem))] rounded-lg border border-border bg-surface p-0 text-foreground shadow-[var(--shadow-lg)] backdrop:bg-[var(--navy-950)]/55" aria-labelledby="delete-category-title" aria-describedby="delete-category-description">
      <div className="p-5 sm:p-6"><h2 id="delete-category-title" className="type-h3">Удалить категорию?</h2><p id="delete-category-description" className="mt-3 text-sm leading-relaxed text-muted">Категория “{category?.name}” будет удалена. Это действие нельзя отменить.</p>{notice?.type === "error" && <p role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-sm text-destructive">{notice.text}</p>}<div className="mt-6 flex justify-end gap-3"><Button variant="outline" size="sm" disabled={pending} onClick={closeDialog}>Отмена</Button><Button variant="destructive" size="sm" disabled={pending} onClick={() => void remove()}>{pending ? "Удаление…" : "Удалить"}</Button></div></div>
    </dialog>
    {notice?.type === "success" && <p role="status" className="fixed bottom-4 right-4 z-50 max-w-sm rounded-md bg-success px-4 py-3 text-sm font-semibold text-white shadow-[var(--shadow-lg)]">{notice.text}</p>}
  </>;
}

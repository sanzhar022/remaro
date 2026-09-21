"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

type DeleteResponse = { error?: string; message?: string };

export function CategoryDeleteButton({ categoryId, categoryName }: { categoryId: string; categoryName: string }) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timeout = window.setTimeout(() => setNotice(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  function openDialog() {
    setNotice(null);
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    if (!pending) dialogRef.current?.close();
  }

  async function remove() {
    if (pending) return;
    setPending(true);
    setNotice(null);
    try {
      const response = await fetch(`/api/admin/categories/${encodeURIComponent(categoryId)}`, { method: "DELETE" });
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
    <button type="button" onClick={openDialog} className="inline-flex items-center gap-1 font-semibold text-destructive transition-colors hover:text-[#a92b2b] hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-destructive/20" aria-haspopup="dialog">
      <Trash2 size={15} aria-hidden="true" />Удалить
    </button>
    <dialog
      ref={dialogRef}
      onCancel={(event) => { if (pending) event.preventDefault(); }}
      onClick={(event) => { if (event.target === event.currentTarget) closeDialog(); }}
      className="m-auto w-[min(30rem,calc(100%-2rem))] rounded-lg border border-border bg-surface p-0 text-foreground shadow-[var(--shadow-lg)] backdrop:bg-[var(--navy-950)]/55"
      aria-labelledby={`delete-category-title-${categoryId}`}
      aria-describedby={`delete-category-description-${categoryId}`}
    >
      <div className="p-5 sm:p-6">
        <h2 id={`delete-category-title-${categoryId}`} className="type-h3">Удалить категорию?</h2>
        <p id={`delete-category-description-${categoryId}`} className="mt-3 text-sm leading-relaxed text-muted">
          Категория “{categoryName}” будет удалена. Это действие нельзя отменить.
        </p>
        {notice?.type === "error" && <p role="alert" className="mt-4 rounded-md bg-red-50 p-3 text-sm text-destructive">{notice.text}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" size="sm" disabled={pending} onClick={closeDialog}>Отмена</Button>
          <Button variant="destructive" size="sm" disabled={pending} onClick={() => void remove()}>
            {pending ? "Удаление…" : "Удалить"}
          </Button>
        </div>
      </div>
    </dialog>
    {notice?.type === "success" && <p
      role="status"
      className="fixed bottom-4 right-4 z-50 max-w-sm rounded-md bg-success px-4 py-3 text-sm font-semibold text-white shadow-[var(--shadow-lg)]"
    >{notice.text}</p>}
  </>;
}

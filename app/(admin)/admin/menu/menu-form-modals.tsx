"use client";

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { createCategory, createMenuItem } from "@/app/(admin)/admin/actions";
import { SuccessActionForm } from "@/components/feedback/success-action-form";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

type CategoryOption = {
  id: string;
  name: string;
};

function AdminFormModal({
  title,
  description,
  open,
  onClose,
  children,
}: {
  title: string;
  description: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const container = dialogRef.current;
    if (!container) return;

    const focusable = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const target = focusable[0] ?? container;
    target.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const container = dialogRef.current;
      if (!container) return;
      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => !element.hasAttribute("disabled"));
      if (focusable.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open || !mounted) return null;

  function handleOverlayClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    onClose();
  }

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      tabIndex={-1}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[100] flex items-start justify-center bg-zinc-950/60 p-4 pt-16 backdrop-blur-sm"
    >
      <Card className="w-full max-w-2xl p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Button type="button" variant="ghost" onClick={onClose} aria-label={`Close ${title} modal`}>
            Close
          </Button>
        </div>
        {children}
      </Card>
    </div>,
    document.body,
  );
}

export function MenuFormModals({
  categories,
  fieldClass,
  focusRingClass,
}: {
  categories: CategoryOption[];
  fieldClass: string;
  focusRingClass: string;
}) {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isMenuItemModalOpen, setIsMenuItemModalOpen] = useState(false);

  return (
    <>
      <div className="ml-auto flex shrink-0 items-center gap-2 pl-3">
        <Button type="button" variant="secondary" className="cursor-pointer" onClick={() => setIsCategoryModalOpen(true)}>
          New category
        </Button>
        <Button type="button" className="cursor-pointer" onClick={() => setIsMenuItemModalOpen(true)}>
          New menu item
        </Button>
      </div>

      <AdminFormModal
        title="New category"
        description="Create category names and ordering used by the storefront menu."
        open={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      >
        <SuccessActionForm action={createCategory} className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm md:col-span-2">
            <span className="font-medium text-[var(--text-primary)]">Name</span>
            <input name="name" required className={fieldClass} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-[var(--text-primary)]">Sort order</span>
            <input name="sortOrder" type="number" defaultValue={0} className={fieldClass} />
          </label>
          <div className="flex items-end justify-end md:col-span-2">
            <Button type="submit">Create</Button>
          </div>
        </SuccessActionForm>
      </AdminFormModal>

      <AdminFormModal
        title="New menu item"
        description="Price is entered in dollars and stored as cents for consistency."
        open={isMenuItemModalOpen}
        onClose={() => setIsMenuItemModalOpen(false)}
      >
        <SuccessActionForm action={createMenuItem} className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-sm md:col-span-2">
            <span className="font-medium text-[var(--text-primary)]">Name</span>
            <input name="name" required className={fieldClass} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm md:col-span-2">
            <span className="font-medium text-[var(--text-primary)]">Description</span>
            <textarea name="description" rows={3} className={fieldClass} />
          </label>
          <div className="flex flex-col gap-1.5 text-sm">
            <label htmlFor="categoryIds" className="flex items-center justify-between gap-3">
              <span className="font-medium text-[var(--text-primary)]">Categories</span>
              <span className="text-xs text-[var(--text-meta)]">{categories.length} available</span>
            </label>
            <select
              id="categoryIds"
              name="categoryIds"
              multiple
              required
              size={Math.min(categories.length, 7)}
              className={`${fieldClass} min-h-44`}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-[var(--text-meta)]">Select one or more categories (Ctrl/Cmd + click for multi-select).</p>
          </div>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-[var(--text-primary)]">Price (USD)</span>
            <input name="price" type="number" inputMode="decimal" step="0.01" min="0.01" required className={fieldClass} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm md:col-span-2">
            <span className="font-medium text-[var(--text-primary)]">Image (optional)</span>
            <input
              name="image"
              type="file"
              accept="image/*"
              className={`rounded-md text-sm text-[var(--text-meta)] file:mr-3 file:rounded-md file:border file:border-zinc-300 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-[var(--text-primary)] hover:file:bg-zinc-200 ${focusRingClass}`}
            />
          </label>
          <Button type="submit" className="md:col-span-2">
            Save item
          </Button>
        </SuccessActionForm>
      </AdminFormModal>
    </>
  );
}

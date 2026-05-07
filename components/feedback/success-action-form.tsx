"use client";

import { useActionState, useEffect, useRef } from "react";
import type { ActionFeedback } from "@/lib/actions/action-feedback";
import { useSuccessToast } from "@/components/feedback/success-toast-provider";

type SuccessActionFormProps = Omit<React.ComponentProps<"form">, "action" | "onSubmit"> & {
  action: (formData: FormData) => Promise<ActionFeedback>;
  successMessage?: string;
};

export function SuccessActionForm({ action, successMessage, children, ...formProps }: SuccessActionFormProps) {
  const { showSuccess } = useSuccessToast();
  const handledResultRef = useRef<ActionFeedback | null>(null);
  const [result, formAction, isPending] = useActionState(
    async (_previousState: ActionFeedback, formData: FormData) => action(formData),
    { ok: false } satisfies ActionFeedback,
  );

  useEffect(() => {
    if (!result.ok || handledResultRef.current === result) return;
    handledResultRef.current = result;
    showSuccess(result.message ?? successMessage ?? "Saved successfully");
  }, [result, showSuccess, successMessage]);

  return (
    <form {...formProps} action={formAction} aria-busy={isPending}>
      {children}
    </form>
  );
}

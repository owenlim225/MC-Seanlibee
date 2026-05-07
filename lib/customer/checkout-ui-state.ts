import {
  type CheckoutDeliveryOption,
  computeCheckoutPricing,
  resolveDeliveryOption,
  resolveTipCents,
} from "@/lib/customer/checkout-pricing";

export type CheckoutUiState = {
  deliveryOption: CheckoutDeliveryOption;
  tipCents: number;
  consent: boolean;
};

export type CheckoutPricedLineInput = {
  priceCents: number;
  qty: number;
};

export type CheckoutPersonalDefaults = {
  fullName: string;
  phone: string;
  email: string;
};

export function buildPersonalDetailsDefaults(input: {
  userName?: string | null;
  userEmail?: string | null;
  phone?: string | null;
}): CheckoutPersonalDefaults {
  return {
    fullName: input.userName?.trim() ?? "",
    phone: input.phone?.trim() ?? "",
    email: input.userEmail?.trim() ?? "",
  };
}

export function createCheckoutUiState(input?: {
  deliveryOption?: string;
  tipCents?: number;
  consent?: boolean;
}): CheckoutUiState {
  return {
    deliveryOption: resolveDeliveryOption(input?.deliveryOption),
    tipCents: resolveTipCents(input?.tipCents),
    consent: Boolean(input?.consent),
  };
}

export function updateCheckoutUiState(
  state: CheckoutUiState,
  patch: Partial<CheckoutUiState>,
): CheckoutUiState {
  return {
    deliveryOption: patch.deliveryOption
      ? resolveDeliveryOption(patch.deliveryOption)
      : state.deliveryOption,
    tipCents:
      patch.tipCents !== undefined
        ? resolveTipCents(patch.tipCents)
        : state.tipCents,
    consent: patch.consent ?? state.consent,
  };
}

export function computeCheckoutSummaryView(
  lines: CheckoutPricedLineInput[],
  state: CheckoutUiState,
) {
  const pricing = computeCheckoutPricing({
    lines,
    deliveryOption: state.deliveryOption,
    tipCents: state.tipCents,
  });

  return {
    ...pricing,
    canSubmit: state.consent,
    consentLabel: state.consent ? "Confirmed" : "Required",
  };
}

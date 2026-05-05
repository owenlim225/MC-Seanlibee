export const DELIVERY_OPTIONS = {
  standard: { label: "Standard delivery", feeCents: 0 },
  priority: { label: "Priority delivery", feeCents: 1900 },
} as const;

export const TIP_OPTIONS_CENTS = [0, 500, 1000, 1500] as const;
export const SERVICE_FEE_CENTS = 500;

export type CheckoutDeliveryOption = keyof typeof DELIVERY_OPTIONS;

export type CheckoutPricedLine = {
  priceCents: number;
  qty: number;
};

export type CheckoutPricingInput = {
  lines: CheckoutPricedLine[];
  deliveryOption?: string;
  tipCents?: number;
};

export function resolveDeliveryOption(option: string | undefined): CheckoutDeliveryOption {
  if (!option) return "standard";
  return option in DELIVERY_OPTIONS ? (option as CheckoutDeliveryOption) : "standard";
}

export function resolveTipCents(raw: number | undefined): number {
  if (raw === undefined) return 0;
  return TIP_OPTIONS_CENTS.includes(raw as (typeof TIP_OPTIONS_CENTS)[number]) ? raw : 0;
}

export function computeCheckoutPricing(input: CheckoutPricingInput) {
  const deliveryOption = resolveDeliveryOption(input.deliveryOption);
  const tipCents = resolveTipCents(input.tipCents);
  const subtotalCents = input.lines.reduce((sum, line) => sum + line.priceCents * line.qty, 0);
  const deliveryFeeCents = DELIVERY_OPTIONS[deliveryOption].feeCents;
  const serviceFeeCents = SERVICE_FEE_CENTS;
  const totalCents = subtotalCents + deliveryFeeCents + serviceFeeCents + tipCents;

  return {
    subtotalCents,
    deliveryOption,
    deliveryFeeCents,
    serviceFeeCents,
    tipCents,
    totalCents,
  };
}

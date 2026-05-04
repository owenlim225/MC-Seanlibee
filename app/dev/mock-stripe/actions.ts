"use server";

import { redirect } from "next/navigation";
import { simulateWebhook } from "@/lib/payments";

export async function completeMockPayment(orderId: string): Promise<void> {
  await simulateWebhook(orderId, "paid");
  redirect(`/customer/orders/${orderId}?paid=1`);
}

import type { IconName } from "@/components/sketch/icons";
import type { DeliveryMethod, OrderStatus } from "@/lib/db/schema";

export const statusLabels: Record<OrderStatus, string> = {
  pending_payment: "Awaiting payment",
  paid: "Order confirmed",
  in_production: "Being made in the workshop",
  ready: "Ready",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  ready_for_collection: "Ready for collection",
  collected: "Collected",
  cancelled: "Cancelled",
};

export const deliveryLabels: Record<DeliveryMethod, string> = {
  collection: "Collect from the Athlone workshop",
  delivery: "Delivery",
  delivery_assembly: "Delivery and assembly",
};

type Step = { statuses: OrderStatus[]; label: string; icon: IconName };

/** The customer-facing journey, which differs for delivery and workshop collection. */
export function trackingSteps(method: DeliveryMethod): Step[] {
  const start: Step[] = [
    { statuses: ["paid"], label: "Order confirmed", icon: "clipboard" },
    { statuses: ["in_production"], label: "In the workshop", icon: "chisel" },
  ];
  if (method === "collection") {
    return [
      ...start,
      { statuses: ["ready", "ready_for_collection"], label: "Ready to collect", icon: "pin" },
      { statuses: ["collected"], label: "Collected", icon: "houseCheck" },
    ];
  }
  return [
    ...start,
    { statuses: ["ready", "out_for_delivery"], label: "On its way", icon: "van" },
    { statuses: ["delivered"], label: "Delivered", icon: "houseCheck" },
  ];
}

export function currentStepIndex(method: DeliveryMethod, status: OrderStatus) {
  return trackingSteps(method).findIndex((s) => s.statuses.includes(status));
}

export function formatCents(amount: number) {
  return new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(amount / 100);
}

export function formatDate(value: string | Date | null) {
  if (!value) return null;
  const d = typeof value === "string" ? new Date(`${value}T12:00:00`) : value;
  return new Intl.DateTimeFormat("en-IE", { weekday: "long", day: "numeric", month: "long" }).format(d);
}

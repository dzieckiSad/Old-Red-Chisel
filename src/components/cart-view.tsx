"use client";

import Link from "next/link";
import { cartTotal, setQuantity, useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { SketchIcon } from "@/components/sketch/icons";
import { CornerMarks, PencilNote } from "@/components/sketch/ornaments";
import { PhotoPlaceholder } from "@/components/ui";

export function CartView() {
  const cart = useCart();

  if (cart.length === 0) {
    return (
      <div className="relative flex flex-col items-center border border-line bg-white p-10 text-center">
        <CornerMarks />
        <SketchIcon name="cart" size={72} />
        <PencilNote className="mt-3">nothing here yet</PencilNote>
        <p className="mt-2 text-graphite">Your cart is empty.</p>
        <Link href="/shop" className="btn btn--primary mt-6">
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 md:grid-cols-[2fr_1fr]">
      <ul className="divide-y divide-line border border-line bg-white">
        {cart.map((item) => (
          <li key={item.key} className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
            <div className="flex items-center gap-4">
              <PhotoPlaceholder className="h-16 w-16 shrink-0" />
              <div>
              <Link href={`/shop/${item.slug}`} className="font-medium text-ink hover:text-brand">
                {item.name}
              </Link>
              {Object.keys(item.options).length > 0 && (
                <p className="mt-1 text-sm text-graphite">
                  {Object.entries(item.options)
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(" · ")}
                </p>
              )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-line bg-cream/50">
                <button
                  type="button"
                  aria-label={`Decrease quantity of ${item.name}`}
                  onClick={() => setQuantity(item.key, item.quantity - 1)}
                  className="px-3 py-1.5 text-lg leading-none hover:text-brand"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm">{item.quantity}</span>
                <button
                  type="button"
                  aria-label={`Increase quantity of ${item.name}`}
                  onClick={() => setQuantity(item.key, item.quantity + 1)}
                  className="px-3 py-1.5 text-lg leading-none hover:text-brand"
                >
                  +
                </button>
              </div>
              <p className="w-20 text-right font-semibold">{formatPrice(item.unitPrice * item.quantity)}</p>
              <button
                type="button"
                aria-label={`Remove ${item.name}`}
                onClick={() => setQuantity(item.key, 0)}
                className="p-1 opacity-60 transition-opacity hover:opacity-100"
              >
                <SketchIcon name="close" size={22} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <aside className="relative h-fit border border-line bg-white p-5">
        <CornerMarks />
        <div className="flex justify-between text-lg font-semibold">
          <span>Subtotal</span>
          <span>{formatPrice(cartTotal(cart))}</span>
        </div>
        <p className="mt-2 text-sm text-graphite">
          Incl. VAT. Delivery, assembly or free workshop collection is chosen at checkout.{" "}
          <Link href="/delivery" className="underline">
            Delivery prices
          </Link>
        </p>
        {/* TODO: connect to Stripe Checkout */}
        <button
          type="button"
          disabled
          className="btn btn--primary mt-5 w-full cursor-not-allowed opacity-50"
        >
          Checkout (coming soon)
        </button>
      </aside>
    </div>
  );
}

"use client";

import Link from "next/link";
import { cartTotal, setQuantity, useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

export function CartView() {
  const cart = useCart();

  if (cart.length === 0) {
    return (
      <div className="border border-line bg-white p-8 text-center">
        <p className="text-graphite">Your cart is empty.</p>
        <Link href="/shop" className="mt-4 inline-block font-semibold text-brand hover:underline">
          Browse the shop →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 md:grid-cols-[2fr_1fr]">
      <ul className="divide-y divide-line border border-line bg-white">
        {cart.map((item) => (
          <li key={item.key} className="flex flex-wrap items-center justify-between gap-4 p-5">
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
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-line">
                <button
                  type="button"
                  aria-label={`Decrease quantity of ${item.name}`}
                  onClick={() => setQuantity(item.key, item.quantity - 1)}
                  className="px-3 py-1.5"
                >
                  −
                </button>
                <span className="w-8 text-center text-sm">{item.quantity}</span>
                <button
                  type="button"
                  aria-label={`Increase quantity of ${item.name}`}
                  onClick={() => setQuantity(item.key, item.quantity + 1)}
                  className="px-3 py-1.5"
                >
                  +
                </button>
              </div>
              <p className="w-20 text-right font-semibold">{formatPrice(item.unitPrice * item.quantity)}</p>
              <button
                type="button"
                onClick={() => setQuantity(item.key, 0)}
                className="text-sm text-graphite hover:text-brand"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit border border-line bg-white p-5">
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

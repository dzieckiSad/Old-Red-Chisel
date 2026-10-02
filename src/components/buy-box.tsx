"use client";

import Link from "next/link";
import { useState } from "react";
import { type Product, modeLabels } from "@/lib/catalog";
import { addToCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

export function BuyBox({ product }: { product: Product }) {
  const options = product.options ?? [];
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(options.map((o) => [o.name, o.choices[0].label])),
  );
  const [added, setAdded] = useState(false);

  const price =
    product.price +
    options.reduce((sum, o) => {
      const choice = o.choices.find((c) => c.label === selected[o.name]);
      return sum + (choice?.priceDelta ?? 0);
    }, 0);

  const quoteHref = `/quote?type=custom-product&product=${product.slug}`;
  const soldOut = product.mode === "in_stock" && (product.stock ?? 0) <= 0;

  if (product.mode === "quote_only") {
    return (
      <div className="rounded-lg border border-line bg-white p-5">
        <p className="text-sm text-graphite">Typical price</p>
        <p className="font-serif text-3xl font-semibold text-ink">from {formatPrice(product.price)}</p>
        <p className="mt-2 text-sm text-graphite">
          Designed around your space. Send us a photo and rough sizes for a quote within 48 hours.
        </p>
        <Link
          href={quoteHref}
          className="mt-5 flex w-full items-center justify-center rounded-md bg-brand px-5 py-3 font-semibold text-white hover:bg-brand-dark"
        >
          Request a quote
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-line bg-white p-5">
      <div className="flex items-baseline justify-between">
        <p className="font-serif text-3xl font-semibold text-ink">{formatPrice(price)}</p>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            product.mode === "in_stock" ? "bg-green-100 text-green-800" : "bg-sand text-ink"
          }`}
        >
          {soldOut ? "Sold out" : modeLabels[product.mode]}
        </span>
      </div>
      <p className="mt-1 text-sm text-graphite">{product.leadTime} · incl. VAT</p>

      {options.map((option) => (
        <fieldset key={option.name} className="mt-5">
          <legend className="text-sm font-medium text-ink">{option.name}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {option.choices.map((choice) => {
              const checked = selected[option.name] === choice.label;
              return (
                <label
                  key={choice.label}
                  className={`cursor-pointer rounded-md border px-3 py-2 text-sm ${
                    checked ? "border-ink bg-ink text-white" : "border-line hover:border-ink/40"
                  }`}
                >
                  <input
                    type="radio"
                    name={option.name}
                    value={choice.label}
                    checked={checked}
                    onChange={() => setSelected((s) => ({ ...s, [option.name]: choice.label }))}
                    className="sr-only"
                  />
                  {choice.label}
                  {choice.priceDelta !== 0 && (
                    <span className="ml-1 opacity-70">
                      {choice.priceDelta > 0 ? "+" : "−"}
                      {formatPrice(Math.abs(choice.priceDelta))}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}

      <button
        type="button"
        disabled={soldOut}
        onClick={() => {
          addToCart({ slug: product.slug, name: product.name, unitPrice: price, options: selected });
          setAdded(true);
        }}
        className="mt-6 w-full rounded-md bg-brand px-5 py-3 font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
      >
        Add to cart
      </button>
      <p aria-live="polite" className="mt-2 min-h-5 text-sm text-green-800">
        {added && (
          <>
            Added to your cart.{" "}
            <Link href="/cart" className="font-semibold underline">
              View cart
            </Link>
          </>
        )}
      </p>

      <Link
        href={quoteHref}
        className="mt-2 block rounded-md border border-dashed border-line p-3 text-sm text-graphite hover:border-brand"
      >
        <span className="font-semibold text-ink">Need a different size or design?</span> We make
        every piece ourselves, so we can build it to your measurements. →
      </Link>
    </div>
  );
}

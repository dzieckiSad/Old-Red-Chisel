"use client";

import { useSyncExternalStore } from "react";

// Client-side cart kept in localStorage until checkout is wired to Stripe.

export type CartItem = {
  key: string;
  slug: string;
  name: string;
  unitPrice: number;
  options: Record<string, string>;
  quantity: number;
};

const STORAGE_KEY = "orc-cart";
const EMPTY: CartItem[] = [];
const listeners = new Set<() => void>();
let items: CartItem[] | null = null;

function read(): CartItem[] {
  if (items) return items;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    items = raw ? (JSON.parse(raw) as CartItem[]) : EMPTY;
  } catch {
    items = EMPTY;
  }
  return items;
}

function write(next: CartItem[]) {
  items = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable (private mode): the cart still works for this page view.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      items = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useCart() {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function addToCart(item: Omit<CartItem, "key" | "quantity">, quantity = 1) {
  const key = `${item.slug}|${JSON.stringify(item.options)}`;
  const current = read();
  const existing = current.find((i) => i.key === key);
  write(
    existing
      ? current.map((i) => (i.key === key ? { ...i, quantity: i.quantity + quantity } : i))
      : [...current, { ...item, key, quantity }],
  );
}

export function setQuantity(key: string, quantity: number) {
  write(
    quantity <= 0
      ? read().filter((i) => i.key !== key)
      : read().map((i) => (i.key === key ? { ...i, quantity } : i)),
  );
}

export function cartTotal(cart: CartItem[]) {
  return cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
}

export function clearCart() {
  write([]);
}

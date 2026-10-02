import { integer, jsonb, pgTable, text, timestamp, uuid, date } from "drizzle-orm/pg-core";

export const orderStatuses = [
  "pending_payment",
  "paid",
  "in_production",
  "ready",
  "out_for_delivery",
  "delivered",
  "ready_for_collection",
  "collected",
  "cancelled",
] as const;
export type OrderStatus = (typeof orderStatuses)[number];

export type OrderItem = {
  slug: string;
  name: string;
  options: Record<string, string>;
  unitPrice: number; // cents
  quantity: number;
};

export type DeliveryMethod = "collection" | "delivery" | "delivery_assembly";

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  /** Encrypted plain password, kept only until the customer has seen it and it's been emailed. */
  passwordSealed: text("password_sealed"),
  status: text("status").$type<OrderStatus>().notNull().default("pending_payment"),
  customerName: text("customer_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  deliveryMethod: text("delivery_method").$type<DeliveryMethod>().notNull(),
  deliveryZone: text("delivery_zone"),
  address: text("address"),
  town: text("town"),
  eircode: text("eircode"),
  notes: text("notes"),
  items: jsonb("items").$type<OrderItem[]>().notNull(),
  subtotal: integer("subtotal").notNull(),
  deliveryFee: integer("delivery_fee").notNull(),
  total: integer("total").notNull(),
  paymentRef: text("payment_ref"),
  etaDate: date("eta_date"),
  statusNote: text("status_note"),
  credentialsShownAt: timestamp("credentials_shown_at", { withTimezone: true }),
  credentialsEmailedAt: timestamp("credentials_emailed_at", { withTimezone: true }),
  paidAt: timestamp("paid_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orderEvents = pgTable("order_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  status: text("status").$type<OrderStatus>().notNull(),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const adminUsers = pgTable("admin_users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  totpSecret: text("totp_secret").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const loginAttempts = pgTable("login_attempts", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
});

// Idempotent DDL, run once per server start. Kept next to the table definitions so the two
// stay in step; switch to drizzle-kit migrations if the schema starts changing often.
export const schemaSql = `
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  password_hash text not null,
  password_sealed text,
  status text not null default 'pending_payment',
  customer_name text not null,
  email text not null,
  phone text not null,
  delivery_method text not null,
  delivery_zone text,
  address text,
  town text,
  eircode text,
  notes text,
  items jsonb not null,
  subtotal integer not null,
  delivery_fee integer not null,
  total integer not null,
  payment_ref text,
  eta_date date,
  status_note text,
  credentials_shown_at timestamptz,
  credentials_emailed_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_status_idx on orders (status, created_at desc);
create table if not exists order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  status text not null,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists order_events_order_idx on order_events (order_id, created_at);
create table if not exists admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  totp_secret text not null,
  created_at timestamptz not null default now()
);
create table if not exists login_attempts (
  key text primary key,
  count integer not null,
  window_start timestamptz not null
);
`;

import { boolean, date, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import type { ProductImage, ProductMode, ProductOption } from "@/lib/catalog";
import type { ProjectImage } from "@/lib/project-types";

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

export const products = pgTable("products", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  mode: text("mode").$type<ProductMode>().notNull(),
  price: integer("price").notNull(), // cents
  salePrice: integer("sale_price"), // cents
  saleEndsAt: date("sale_ends_at"),
  summary: text("summary").notNull().default(""),
  description: text("description").notNull().default(""),
  dimensions: text("dimensions").notNull().default(""),
  material: text("material").notNull().default(""),
  leadTime: text("lead_time").notNull().default(""),
  stock: integer("stock"),
  options: jsonb("options").$type<ProductOption[]>().notNull().default([]),
  images: jsonb("images").$type<ProductImage[]>().notNull().default([]),
  featured: boolean("featured").notNull().default(false),
  hidden: boolean("hidden").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  place: text("place").notNull().default(""),
  type: text("type").notNull().default(""),
  summary: text("summary").notNull().default(""),
  description: text("description").notNull().default(""),
  materials: text("materials").notNull().default(""),
  duration: text("duration").notNull().default(""),
  before: jsonb("before").$type<ProjectImage | null>(),
  after: jsonb("after").$type<ProjectImage | null>(),
  photos: jsonb("photos").$type<ProjectImage[]>().notNull().default([]),
  featured: boolean("featured").notNull().default(false),
  hidden: boolean("hidden").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const quoteStatuses = ["new", "contacted", "quoted", "survey_booked", "won", "lost"] as const;
export type QuoteStatus = (typeof quoteStatuses)[number];

/** Quote requests sent from the website form. */
export const quotes = pgTable("quotes", {
  id: uuid("id").primaryKey().defaultRandom(),
  status: text("status").$type<QuoteStatus>().notNull().default("new"),
  projectType: text("project_type").notNull(),
  product: text("product").notNull().default(""),
  description: text("description").notNull(),
  measurements: text("measurements").notNull().default(""),
  budget: text("budget").notNull().default(""),
  timing: text("timing").notNull().default(""),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  town: text("town").notNull(),
  eircode: text("eircode").notNull().default(""),
  contactPreference: text("contact_preference").notNull().default(""),
  photos: jsonb("photos").$type<string[]>().notNull().default([]),
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Panel-wide settings, e.g. the sealed authenticator secret once two-step sign-in is on. */
export const adminSettings = pgTable("admin_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
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
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  mode text not null,
  price integer not null,
  sale_price integer,
  sale_ends_at date,
  summary text not null default '',
  description text not null default '',
  dimensions text not null default '',
  material text not null default '',
  lead_time text not null default '',
  stock integer,
  options jsonb not null default '[]',
  images jsonb not null default '[]',
  featured boolean not null default false,
  hidden boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_listing_idx on products (hidden, sort_order);
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  place text not null default '',
  type text not null default '',
  summary text not null default '',
  description text not null default '',
  materials text not null default '',
  duration text not null default '',
  before jsonb,
  after jsonb,
  photos jsonb not null default '[]',
  featured boolean not null default false,
  hidden boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists projects_listing_idx on projects (hidden, sort_order);
create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'new',
  project_type text not null,
  product text not null default '',
  description text not null,
  measurements text not null default '',
  budget text not null default '',
  timing text not null default '',
  name text not null,
  email text not null,
  phone text not null,
  town text not null,
  eircode text not null default '',
  contact_preference text not null default '',
  photos jsonb not null default '[]',
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists quotes_status_idx on quotes (status, created_at desc);
create table if not exists admin_settings (
  key text primary key,
  value text not null
);
create table if not exists login_attempts (
  key text primary key,
  count integer not null,
  window_start timestamptz not null
);
`;

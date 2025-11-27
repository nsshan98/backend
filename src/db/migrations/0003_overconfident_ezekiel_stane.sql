CREATE TABLE "order_idempotency_keys" (
	"key" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"order_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" varchar DEFAULT 'pending' NOT NULL,
	"payment_status" varchar DEFAULT 'pending' NOT NULL,
	"shipping_address" varchar NOT NULL,
	"shipping_phone_number" varchar NOT NULL,
	"shipping_email" varchar,
	"shipping_line1" varchar,
	"shipping_city" varchar,
	"shipping_district" varchar,
	"shipping_instructions" varchar,
	"sub_total" numeric(10, 2),
	"shipping_cost" numeric(10, 2) DEFAULT '0' NOT NULL,
	"tax_total" numeric(10, 2) DEFAULT '0' NOT NULL,
	"discount_total" numeric(10, 2) DEFAULT '0' NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"product_id" uuid NOT NULL,
	"product_name" text NOT NULL,
	"product_image" text,
	"cost_price" numeric NOT NULL,
	"unit_price" numeric NOT NULL,
	"discounted_price" numeric,
	"quantity" numeric NOT NULL,
	"total_price" numeric NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
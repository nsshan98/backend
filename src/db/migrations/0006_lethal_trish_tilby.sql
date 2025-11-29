ALTER TABLE "orders" ADD COLUMN "label" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "address" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "phone" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "line1" varchar;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "line2" varchar;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "district" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "upazila" varchar;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "area" varchar;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "post_code" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "country" varchar;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "latitude" varchar;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "longitude" varchar;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "is_default" varchar;--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "shipping_address";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "shipping_phone_number";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "shipping_email";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "shipping_line1";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "shipping_city";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "shipping_district";
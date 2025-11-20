CREATE TYPE "public"."role_enum" AS ENUM('SuppaDuppaAdmin', 'User', 'Admin', 'Editor');--> statement-breakpoint
CREATE TABLE "employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255),
	"show_email" boolean DEFAULT true,
	"official_phone" varchar(20),
	"show_official_phone" boolean DEFAULT true,
	"personal_phone" varchar(20),
	"show_personal_phone" boolean DEFAULT true,
	"designation" varchar(255) NOT NULL,
	"department" varchar(255) NOT NULL,
	"type" varchar(255),
	"serial" integer,
	"sorting_order" integer,
	"is_published" boolean DEFAULT true,
	"image" json,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"hashed_refresh_token" text,
	"role" "role_enum" DEFAULT 'User' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"image_url" varchar(512),
	"stock_quantity" integer DEFAULT 0 NOT NULL,
	"cost_price" integer NOT NULL,
	"regular_price" integer NOT NULL,
	"sale_price" integer,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"user_id" uuid NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
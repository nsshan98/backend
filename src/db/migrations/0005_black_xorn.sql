CREATE TABLE "user_addresses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"label" varchar(32) DEFAULT 'Home',
	"address" text NOT NULL,
	"phone" varchar(32) NOT NULL,
	"line1" text,
	"line2" text,
	"district" varchar(64) NOT NULL,
	"upazila" varchar(64),
	"area" varchar(128),
	"post_code" varchar(16) NOT NULL,
	"country" varchar(64) DEFAULT 'Bangladesh',
	"latitude" numeric(10, 6),
	"longitude" numeric(10, 6),
	"is_default" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_addresses" ADD CONSTRAINT "user_addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
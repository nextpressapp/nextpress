CREATE TABLE "site_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"site_name" text NOT NULL,
	"description" text NOT NULL,
	"home_title" text NOT NULL,
	"home_description" text NOT NULL,
	"about_title" text NOT NULL,
	"about_description" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

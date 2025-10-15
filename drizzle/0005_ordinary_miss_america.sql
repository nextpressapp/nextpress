ALTER TABLE "pages" ALTER COLUMN "published" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" DROP COLUMN "home_title";--> statement-breakpoint
ALTER TABLE "site_settings" DROP COLUMN "home_description";--> statement-breakpoint
ALTER TABLE "site_settings" DROP COLUMN "about_title";--> statement-breakpoint
ALTER TABLE "site_settings" DROP COLUMN "about_description";
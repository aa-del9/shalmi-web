ALTER TABLE "promotional_banners" ADD COLUMN "internal_name" text;--> statement-breakpoint
ALTER TABLE "promotional_banners" ADD COLUMN "eyebrow" text;--> statement-breakpoint
ALTER TABLE "promotional_banners" ADD COLUMN "cta_label" text;--> statement-breakpoint
ALTER TABLE "promotional_banners" ADD COLUMN "position" text DEFAULT 'hero' NOT NULL;--> statement-breakpoint
ALTER TABLE "promotional_banners" ADD COLUMN "status" text DEFAULT 'paused' NOT NULL;--> statement-breakpoint
ALTER TABLE "promotional_banners" ADD COLUMN "starts_at" timestamp;--> statement-breakpoint
ALTER TABLE "promotional_banners" ADD COLUMN "ends_at" timestamp;--> statement-breakpoint
UPDATE "promotional_banners" SET "status" = 'live' WHERE "is_active" = true;
ALTER TABLE "categories" ADD COLUMN "icon_key" text;--> statement-breakpoint
ALTER TABLE "categories" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;
ALTER TABLE "vendors" ADD COLUMN "display_id" text;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "full_name" text;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) AS rn
  FROM "vendors"
  WHERE display_id IS NULL
)
UPDATE "vendors" v
SET display_id = 'VND-' || LPAD(ranked.rn::text, 4, '0')
FROM ranked
WHERE ranked.id = v.id;--> statement-breakpoint
ALTER TABLE "vendors" ALTER COLUMN "display_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_display_id_unique" UNIQUE("display_id");

ALTER TABLE "order_items" RENAME COLUMN "unit_price_cents" TO "unit_price";--> statement-breakpoint
ALTER TABLE "vendor_ledger" RENAME COLUMN "amount_cents" TO "amount";--> statement-breakpoint
ALTER TABLE "vendor_ledger" RENAME COLUMN "note" TO "description";--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_user_order_id_unique";--> statement-breakpoint
ALTER TABLE "vendors" ALTER COLUMN "city" SET DEFAULT '';--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "hub" text NOT NULL;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "bank_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "account_title" text NOT NULL;--> statement-breakpoint
ALTER TABLE "vendors" ADD COLUMN "iban" text NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "display_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "total_items_cost" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "total_shipping_cost" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "grand_total" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "sub_orders" ADD COLUMN "courier_tracking_id" text;--> statement-breakpoint
ALTER TABLE "sub_orders" ADD COLUMN "weight_grams" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "sub_orders" ADD COLUMN "cod_amount" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "sub_orders" ADD COLUMN "items_total" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "sub_orders" ADD COLUMN "shipping_fee_customer" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "sub_orders" ADD COLUMN "coolie_fee_reimbursement" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "sub_orders" ADD COLUMN "courier_cost" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "sub_orders" ADD COLUMN "platform_commission" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "total_price" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "vendor_ledger" ADD COLUMN "direction" text NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "user_order_id";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "total_delivery_fee_cents";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "needs_wallet_refund";--> statement-breakpoint
ALTER TABLE "order_items" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "vendor_ledger" DROP COLUMN "acted_by";--> statement-breakpoint
ALTER TABLE "vendor_ledger" DROP COLUMN "updated_at";--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_display_id_unique" UNIQUE("display_id");
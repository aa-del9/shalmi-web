-- Buyer signup (Batch 7) — sub-role on retailer accounts.
-- Per OQ-R(a): column name is `retailer_type` (not `account_type`),
-- nullable. Existing retailer rows stay NULL until they self-identify.
-- Application-level constraint via zod: ('generic' | 'shopkeeper').

ALTER TABLE "user" ADD COLUMN "retailer_type" text;

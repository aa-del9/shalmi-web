/**
 * Common metadata field schemas
 */

import { z } from "zod";

/**
 * Timestamp fields schema
 */
export const timestampFieldsSchema = z.object({
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type TimestampFields = z.infer<typeof timestampFieldsSchema>;

/**
 * Soft delete fields schema
 */
export const softDeleteFieldsSchema = z.object({
  deletedAt: z.coerce.date().nullable(),
  isDeleted: z.boolean().default(false),
});

export type SoftDeleteFields = z.infer<typeof softDeleteFieldsSchema>;

/**
 * Base entity schema (with ID and timestamps)
 */
export const baseEntitySchema = z
  .object({
    id: z.string().uuid(),
  })
  .merge(timestampFieldsSchema);

export type BaseEntity = z.infer<typeof baseEntitySchema>;

/**
 * Audit fields schema
 */
export const auditFieldsSchema = z.object({
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
});

export type AuditFields = z.infer<typeof auditFieldsSchema>;

/**
 * SEO metadata schema
 */
export const seoMetadataSchema = z.object({
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  metaKeywords: z.array(z.string()).optional(),
  ogImage: z.string().url().optional(),
  canonicalUrl: z.string().url().optional(),
});

export type SeoMetadata = z.infer<typeof seoMetadataSchema>;

/**
 * Slug field schema
 */
export const slugSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format");

/**
 * Email schema with validation
 */
export const emailSchema = z.string().email("Invalid email address");

/**
 * Phone number schema (basic international format)
 */
export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number");

/**
 * URL schema
 */
export const urlSchema = z.string().url("Invalid URL");

/**
 * UUID schema
 */
export const uuidSchema = z.string().uuid("Invalid UUID");

# @repo/storage

Server-side Supabase Storage helpers for uploads and public URLs.

## Environment

Set these in the app that uses this package (e.g. `apps/web/.env`):

- **SUPABASE_URL** – Your Supabase project URL
- **SUPABASE_SERVICE_ROLE_KEY** – Service role key (server-only; never expose to the client)

## Buckets

Create buckets in the Supabase dashboard (or via CLI). For product images the code uses the bucket name **`product-assets`**. Ensure the bucket exists and has the desired access (e.g. public read for product images).

## Usage

```ts
import {
  getSupabaseServerClient,
  generateUniqueFilename,
  uploadFile,
  getPublicUrl,
} from '@repo/storage';

// Upload and get URL
const ext = 'jpg';
const path = generateUniqueFilename(ext);
const buffer = Buffer.from(await file.arrayBuffer());
await uploadFile('product-assets', path, buffer);
const url = getPublicUrl('product-assets', path);
```

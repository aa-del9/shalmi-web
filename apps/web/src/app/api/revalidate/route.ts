import type { NextRequest } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { z } from 'zod';
import { serverEnv } from '@/modules/core/env/server';
import { jsonSuccess, jsonError } from '@/modules/core/api';

const revalidateBodySchema = z.object({
  tag: z.string().optional(),
  path: z.string().optional(),
  revalidateAll: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  const expected = serverEnv.REVALIDATE_SECRET_TOKEN;
  if (expected == null || expected === '') {
    return jsonError(
      'Unauthorized: revalidation secret is not configured',
      401
    );
  }
  if (secret !== expected) {
    return jsonError('Unauthorized', 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON body', 400);
  }

  const parsed = revalidateBodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError('Invalid request body', 400);
  }

  const { tag, path: pathToRevalidate, revalidateAll } = parsed.data;

  try {
    if (revalidateAll) {
      revalidatePath('/', 'layout');
    } else if (tag) {
      revalidateTag(tag);
    } else if (pathToRevalidate) {
      revalidatePath(pathToRevalidate);
    } else {
      return jsonError('Provide tag, path, or revalidateAll', 400);
    }
    return jsonSuccess();
  } catch (err) {
    console.error('POST /api/revalidate error:', err);
    return jsonError('Revalidation failed', 500);
  }
}

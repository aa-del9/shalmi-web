/**
 * Build deterministic confirmation prompts and result lines for the
 * write-tool YES/NO state machine. Crucially, these are constructed
 * locally — no Gemini round-trip — so confirmation flows don't burn
 * tokens.
 *
 * Each tool has a matching English + Roman Urdu pair; the worker
 * picks one based on `language` (detected from the user's message
 * that triggered the tool call).
 *
 * Currency formatter uses fixed `Rs.` and Western digit grouping —
 * matches admin/vendor UI conventions in the rest of the app.
 */

import type { PendingAction } from '@repo/whatsapp-core';

function fmtRupees(value: number): string {
  return `Rs. ${value.toLocaleString('en-PK')}`;
}

function statusLabel(status: string): string {
  if (status === 'handed_to_courier') return 'handed to courier';
  return status.replace(/_/g, ' ');
}

interface PriceConfirmInput {
  productName: string;
  sku: string | null;
  oldPriceRupees: number;
  newPriceRupees: number;
}

interface StockConfirmInput {
  productName: string;
  sku: string | null;
  oldStock: number;
  newStock: number;
}

interface OrderConfirmInput {
  orderDisplayId: string;
  customerName: string;
  oldStatus: string;
  newStatus: string;
}

function nameWithSku(name: string, sku: string | null): string {
  return sku ? `${name} (${sku})` : name;
}

export function buildConfirmationPrompt(
  action: PendingAction
): string {
  if (action.toolName === 'update_product_price') {
    const p = action.preview as unknown as PriceConfirmInput;
    if (action.language === 'ur-roman') {
      return (
        `${nameWithSku(p.productName, p.sku)} ka price ${fmtRupees(p.oldPriceRupees)} ` +
        `se ${fmtRupees(p.newPriceRupees)} kar dein? ` +
        `YES likhain confirm ke liye, NO cancel ke liye.`
      );
    }
    return (
      `Update ${nameWithSku(p.productName, p.sku)} price from ` +
      `${fmtRupees(p.oldPriceRupees)} to ${fmtRupees(p.newPriceRupees)}? ` +
      `Reply YES to confirm or NO to cancel.`
    );
  }
  if (action.toolName === 'update_product_stock') {
    const p = action.preview as unknown as StockConfirmInput;
    if (action.language === 'ur-roman') {
      return (
        `${nameWithSku(p.productName, p.sku)} ka stock ${p.oldStock} se ` +
        `${p.newStock} kar dein? ` +
        `YES likhain confirm ke liye, NO cancel ke liye.`
      );
    }
    return (
      `Set ${nameWithSku(p.productName, p.sku)} stock from ${p.oldStock} ` +
      `to ${p.newStock}? Reply YES to confirm or NO to cancel.`
    );
  }
  if (action.toolName === 'update_order_status') {
    const p = action.preview as unknown as OrderConfirmInput;
    if (action.language === 'ur-roman') {
      return (
        `Order ${p.orderDisplayId} (${p.customerName}) ko ` +
        `"${statusLabel(p.newStatus)}" mark kar dein? ` +
        `YES likhain confirm ke liye, NO cancel ke liye.`
      );
    }
    return (
      `Mark order ${p.orderDisplayId} for ${p.customerName} as ` +
      `"${statusLabel(p.newStatus)}"? Reply YES to confirm or NO to cancel.`
    );
  }
  // Defensive default — unknown tool. Treat as plain English.
  return `Apply this update? Reply YES to confirm or NO to cancel.`;
}

export function buildAppliedReply(
  action: PendingAction,
  result: unknown
): string {
  const r = result as Record<string, unknown>;
  if (action.toolName === 'update_product_price') {
    const newPrice =
      typeof r?.newPrice === 'number' ? (r.newPrice as number) : null;
    const productName =
      typeof r?.productName === 'string' ? (r.productName as string) : 'product';
    const sku = typeof r?.sku === 'string' ? (r.sku as string) : null;
    if (action.language === 'ur-roman') {
      return `Done — ${nameWithSku(productName, sku)} ka price ${
        newPrice !== null ? fmtRupees(newPrice) : 'updated'
      } kar diya.`;
    }
    return `Done — updated ${nameWithSku(productName, sku)} price to ${
      newPrice !== null ? fmtRupees(newPrice) : 'requested value'
    }.`;
  }
  if (action.toolName === 'update_product_stock') {
    const newStock =
      typeof r?.newStock === 'number' ? (r.newStock as number) : null;
    const productName =
      typeof r?.productName === 'string' ? (r.productName as string) : 'product';
    const sku = typeof r?.sku === 'string' ? (r.sku as string) : null;
    if (action.language === 'ur-roman') {
      return `Done — ${nameWithSku(productName, sku)} ka stock ${
        newStock !== null ? newStock : 'updated'
      } kar diya.`;
    }
    return `Done — set ${nameWithSku(productName, sku)} stock to ${
      newStock !== null ? newStock : 'requested value'
    }.`;
  }
  if (action.toolName === 'update_order_status') {
    const newStatus =
      typeof r?.newStatus === 'string' ? (r.newStatus as string) : null;
    if (action.language === 'ur-roman') {
      return `Done — order status "${
        newStatus !== null ? statusLabel(newStatus) : 'updated'
      }" kar diya.`;
    }
    return `Done — order status updated to "${
      newStatus !== null ? statusLabel(newStatus) : 'requested value'
    }".`;
  }
  return action.language === 'ur-roman' ? 'Done.' : 'Done.';
}

export function buildCancelledReply(action: PendingAction): string {
  return action.language === 'ur-roman' ? 'Cancelled. Koi update nahi hua.' : 'Cancelled.';
}

export function buildExpiredReply(action: PendingAction): string {
  return action.language === 'ur-roman'
    ? 'Confirmation expire ho gayi. Phir se request bhejein.'
    : 'That confirmation expired. Please try again.';
}

export function buildInvalidNudge(action: PendingAction): string {
  return action.language === 'ur-roman'
    ? 'YES ya NO likh kar reply karein previous question ka.'
    : 'Reply YES or NO to the previous question.';
}

export function buildAutoCancelReply(action: PendingAction): string {
  return action.language === 'ur-roman'
    ? 'Cancelled — bohot zyada invalid replies aaye.'
    : 'Cancelled — too many invalid replies.';
}

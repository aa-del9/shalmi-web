/**
 * URL search parameter key names for type-safe URL state management
 */

export const SEARCH_PARAM_KEYS = {
  // Pagination
  PAGE: "page",
  PAGE_SIZE: "pageSize",
  LIMIT: "limit",
  OFFSET: "offset",

  // Sorting
  SORT_BY: "sortBy",
  SORT_ORDER: "sortOrder",

  // Filtering
  SEARCH: "search",
  QUERY: "q",
  CATEGORY: "category",
  STATUS: "status",
  DATE_FROM: "dateFrom",
  DATE_TO: "dateTo",

  // UI State
  TAB: "tab",
  VIEW: "view",
  MODAL: "modal",

  // Auth
  REDIRECT: "redirect",
  CALLBACK_URL: "callbackUrl",
  TOKEN: "token",
} as const;

export type SearchParamKey =
  (typeof SEARCH_PARAM_KEYS)[keyof typeof SEARCH_PARAM_KEYS];

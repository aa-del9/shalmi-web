/**
 * URL construction and manipulation utilities
 */

/**
 * Build URL with query parameters
 */
export const buildUrl = (
  baseUrl: string,
  params?: Record<string, string | number | boolean | undefined | null>
): string => {
  if (!params) return baseUrl;

  const url = new URL(baseUrl, 'http://placeholder');
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value));
    }
  });

  // Return path + search for relative URLs
  if (baseUrl.startsWith('/')) {
    return url.pathname + url.search;
  }

  return url.toString();
};

/**
 * Parse query string into object
 */
export const parseQueryString = (
  queryString: string
): Record<string, string> => {
  const params = new URLSearchParams(queryString);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
};

/**
 * Join URL paths correctly
 */
export const joinPaths = (...paths: string[]): string => {
  return paths
    .map((path, index) => {
      if (index === 0) {
        return path.replace(/\/+$/, '');
      }
      return path.replace(/^\/+|\/+$/g, '');
    })
    .filter(Boolean)
    .join('/');
};

/**
 * Check if URL is absolute
 */
export const isAbsoluteUrl = (url: string): boolean => {
  return /^https?:\/\//i.test(url);
};

/**
 * Get domain from URL
 */
export const getDomain = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return '';
  }
};

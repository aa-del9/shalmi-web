/**
 * String manipulation utilities
 */

/**
 * Compute initials from a name (max 2 characters)
 */
export const computeInitials = (name: string): string => {
  const initials = name
    ?.trim()
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return initials || '';
};

/**
 * Truncate string to specified length with ellipsis
 */
export const truncate = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
};

/**
 * Convert string to slug format
 */
export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Capitalize first letter of string
 */
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Convert camelCase to Title Case
 */
export const camelToTitle = (str: string): string => {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
};

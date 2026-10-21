/**
 * Pencil §3.10 user-card avatar — initials are the first letter of the
 * first two whitespace-separated parts of the display name.
 *
 * Per gap-analysis Q12: "Tariq Ahmed" → "TA"; single name "Ali" → "A".
 */
export function computeInitials(name: string | null | undefined): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  const first = parts[0]!.charAt(0);
  const second = parts[1]?.charAt(0) ?? '';
  return (first + second).toUpperCase();
}

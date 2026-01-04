/**
 * Converts Zod's fieldErrors format (Record<string, string[]>)
 * to a simpler format (Record<string, string>) by taking the first error message
 */
export function flattenFieldErrors(
  fieldErrors: Record<string, string[] | undefined>
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(fieldErrors).map(([key, errors]) => [key, errors?.[0] || ''])
  );
}

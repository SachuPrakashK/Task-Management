/** Formats a Date as a local yyyy-MM-dd string (matches the `deadline`
 * field's format, and Task.deadline / calendar day keys need to compare
 * equal without any timezone surprises from toISOString()). */
export function formatIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${d}-${m}-${y}`;
}

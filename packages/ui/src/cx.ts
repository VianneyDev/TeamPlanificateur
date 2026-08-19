export function cx(...parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

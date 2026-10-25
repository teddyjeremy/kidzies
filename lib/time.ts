/** True when the ISO timestamp is later than the current time. */
export function isFuture(iso: string | null | undefined): boolean {
  return !!iso && new Date(iso).getTime() > Date.now();
}

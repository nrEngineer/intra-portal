// ─── useGreeting ─────────────────────────────────────────────────────────────
// Returns a time-based Japanese greeting string.

export function useGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "おはようございます";
  if (hour < 17) return "お疲れ様です";
  return "お疲れ様でした";
}

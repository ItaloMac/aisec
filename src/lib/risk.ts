export const ALERT_THRESHOLD = 60; // seconds

export function riskLevel(seconds: number) {
  const r = Math.min(seconds / ALERT_THRESHOLD, 1);
  if (r < 0.01) return "idle" as const;
  if (r < 0.4) return "low" as const;
  if (r < 0.7) return "mid" as const;
  if (r < 1) return "high" as const;
  return "critical" as const;
}

export function riskColor(seconds: number): string {
  const r = Math.min(seconds / ALERT_THRESHOLD, 1);
  // interpolate hue from 150 (green) -> 25 (red)
  const hue = 150 - r * 125;
  const light = 55 + (1 - r) * 5;
  return `hsl(${hue}, 80%, ${light}%)`;
}

export function riskBg(seconds: number, alpha = 0.18): string {
  const r = Math.min(seconds / ALERT_THRESHOLD, 1);
  const hue = 150 - r * 125;
  return `hsla(${hue}, 80%, 50%, ${alpha + r * 0.25})`;
}

/** Display helpers for mock portfolio facades. */

export function formatGbp(n: number, style: "exact" | "compact" | "thousands" = "exact") {
  if (style === "compact") {
    if (Math.abs(n) >= 1_000_000) {
      const m = n / 1_000_000
      const rounded = Math.round(m * 100) / 100
      return `£${rounded}m`
    }
    if (Math.abs(n) >= 1_000) {
      return `£${Math.round(n / 1_000)}k`
    }
    return `£${Math.round(n)}`
  }
  if (style === "thousands") {
    return `£${Math.round(n / 1_000)}k`
  }
  return `£${Math.round(n).toLocaleString("en-GB")}`
}

export function formatPct(n: number, decimals = 1) {
  const value = Number.isInteger(n) && decimals === 0 ? n : Number(n.toFixed(decimals))
  return `${value}%`
}

export function formatVolume(n: number) {
  if (n >= 10_000) {
    const k = n / 1_000
    return Number.isInteger(k) ? `${k}k` : `${Math.round(k * 10) / 10}k`
  }
  return Math.round(n).toLocaleString("en-GB")
}

export function formatPp(n: number, decimals = 1) {
  const sign = n > 0 ? "+" : ""
  return `${sign}${n.toFixed(decimals)}pp`
}

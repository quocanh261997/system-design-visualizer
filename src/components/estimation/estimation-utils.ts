const UNITS_COMPACT = [
  { threshold: 1e15, suffix: 'P' },
  { threshold: 1e12, suffix: 'T' },
  { threshold: 1e9, suffix: 'B' },
  { threshold: 1e6, suffix: 'M' },
  { threshold: 1e3, suffix: 'K' },
]

const BYTE_UNITS = [
  { threshold: 1e15, suffix: 'PB' },
  { threshold: 1e12, suffix: 'TB' },
  { threshold: 1e9, suffix: 'GB' },
  { threshold: 1e6, suffix: 'MB' },
  { threshold: 1e3, suffix: 'KB' },
  { threshold: 1, suffix: 'B' },
]

export function formatNumber(n: number | null): string {
  if (n === null || !isFinite(n)) return 'N/A'
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

export function formatCompact(n: number | null): string {
  if (n === null || !isFinite(n)) return 'N/A'
  if (n === 0) return '0'
  const abs = Math.abs(n)
  for (const { threshold, suffix } of UNITS_COMPACT) {
    if (abs >= threshold) {
      const val = n / threshold
      return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}${suffix}`
    }
  }
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

export function formatBytes(bytes: number | null): string {
  if (bytes === null || !isFinite(bytes)) return 'N/A'
  if (bytes === 0) return '0 B'
  const abs = Math.abs(bytes)
  for (const { threshold, suffix } of BYTE_UNITS) {
    if (abs >= threshold) {
      const val = bytes / threshold
      return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)} ${suffix}`
    }
  }
  return `${bytes} B`
}

export function formatBandwidth(bytesPerSec: number | null): string {
  if (bytesPerSec === null || !isFinite(bytesPerSec)) return 'N/A'
  return `${formatBytes(bytesPerSec)}/s`
}

export function safeDiv(a: number, b: number): number {
  if (b === 0 || !isFinite(a) || !isFinite(b)) return 0
  return a / b
}

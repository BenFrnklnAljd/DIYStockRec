export const STORAGE_KEY = 'sales_logs_v2'

export function parseCurrency(val: string): number {
  const n = parseFloat(val.replace(/[^0-9.]/g, ''))
  return isNaN(n) ? 0 : n
}

export function formatCurrency(val: string): string {
  const num = parseCurrency(val)
  return num.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function formatDate(val: string): string {
  if (!val) return '—'
  return new Date(val + 'T00:00:00').toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateShort(val: string): string {
  if (!val) return '—'
  return new Date(val + 'T00:00:00').toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

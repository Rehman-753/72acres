const trim = (n) => n.toFixed(2).replace(/\.?0+$/, '')

export function formatPrice(value) {
  const n = Number(value)
  if (!Number.isFinite(n)) return ''
  if (n >= 1e7) return `₹${trim(n / 1e7)} Cr`
  if (n >= 1e5) return `₹${trim(n / 1e5)} L`
  return `₹${n.toLocaleString('en-IN')}`
}

export function formatArea(value, unitLabel) {
  const n = Number(value)
  if (!Number.isFinite(n)) return ''
  return `${n.toLocaleString('en-IN')} ${unitLabel || ''}`.trim()
}

export function formatDate(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const BUDGETS = [
  { label: 'Any Budget', value: '', min: '', max: '' },
  { label: 'Under ₹50L', value: '1', min: '', max: '5000000' },
  { label: '₹50L – ₹1Cr', value: '2', min: '5000000', max: '10000000' },
  { label: '₹1Cr – ₹2Cr', value: '3', min: '10000000', max: '20000000' },
  { label: 'Above ₹2Cr', value: '4', min: '20000000', max: '' },
]

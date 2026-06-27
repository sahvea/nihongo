export const fmt = (secs: number): string => {
  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':')
}

export const fmtShort = (secs: number): string => {
  if (secs < 60) return `${secs}с`
  if (secs < 3600) return `${Math.floor(secs / 60)}м ${secs % 60}с`
  return `${Math.floor(secs / 3600)}ч ${Math.floor((secs % 3600) / 60)}м`
}

export const fmtHours = (secs: number): string => (secs / 3600).toFixed(1) + 'ч'

export const todayStr = (): string => new Date().toISOString().slice(0, 10)

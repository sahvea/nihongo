import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSessions, useAllSessions } from '../hooks/useSessions'
import { SECTIONS } from '../lib/sections'
import { fmtShort } from '../lib/time'
import styles from './StatsPage.module.css'

const MONTHS = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']
const WEEKS = 26 // ~6 months

const buildHeatmap = (secsPerDay: Record<string, number>) => {
  // start from Monday 26 weeks ago
  const today = new Date()
  const dayOfWeek = (today.getDay() + 6) % 7 // Mon=0
  const end = new Date(today)
  const start = new Date(today)
  start.setDate(end.getDate() - dayOfWeek - (WEEKS - 1) * 7)

  const cells: { date: string; secs: number; row: number; col: number }[] = []
  const monthLabels: { col: number; label: string }[] = []
  let lastMonth = -1

  for (let col = 0; col < WEEKS * 7; col += 7) {
    for (let row = 0; row < 7; row++) {
      const d = new Date(start)
      d.setDate(start.getDate() + col + row)
      if (d > today) continue
      const dateStr = d.toISOString().slice(0, 10)
      cells.push({
        date: dateStr,
        secs: secsPerDay[dateStr] ?? 0,
        row,
        col: col / 7,
      })
      if (row === 0 && d.getMonth() !== lastMonth) {
        monthLabels.push({ col: col / 7, label: MONTHS[d.getMonth()] })
        lastMonth = d.getMonth()
      }
    }
  }

  return { cells, monthLabels }
}

const getLevel = (secs: number): 0 | 1 | 2 | 3 | 4 => {
  if (secs === 0) return 0
  if (secs < 30 * 60) return 1
  if (secs < 60 * 60) return 2
  if (secs < 90 * 60) return 3
  return 4
}

const ActivityHeatmap = ({ secsPerDay }: { secsPerDay: Record<string, number> }) => {
  const [tooltip, setTooltip] = useState<{ date: string; secs: number } | null>(null)
  const { cells, monthLabels } = buildHeatmap(secsPerDay)

  return (
    <div className={styles.heatmapWrap}>
      <div className={styles.heatmapMonths}>
        {monthLabels.map((m) => (
          <span
            key={m.col + m.label}
            className={styles.monthLabel}
            style={{ gridColumn: m.col + 1 }}
          >
            {m.label}
          </span>
        ))}
      </div>
      <div className={styles.heatmapGrid}>
        {cells.map((c) => (
          <div
            key={c.date}
            className={`${styles.heatCell} ${styles[`level${getLevel(c.secs)}`]}`}
            style={{ gridRow: c.row + 1, gridColumn: c.col + 1 }}
            onMouseEnter={() => setTooltip({ date: c.date, secs: c.secs })}
            onMouseLeave={() => setTooltip(null)}
          />
        ))}
      </div>
      <div className={styles.tooltip}>
        {tooltip
          ? `${tooltip.secs > 0 ? fmtShort(tooltip.secs) : 'нет занятий'} · ${tooltip.date}`
          : ''}
      </div>
    </div>
  )
}

const SectionBar = ({
  label,
  seconds,
  maxSeconds,
}: {
  label: string
  seconds: number
  maxSeconds: number
}) => {
  const pct = maxSeconds > 0 ? (seconds / maxSeconds) * 100 : 0
  return (
    <div className={styles.barRow}>
      <span className={styles.barLabel}>{label}</span>
      <div className={styles.barTrack}>
        <div className={styles.barFill} style={{ width: `${pct}%` }} />
      </div>
      <span className={styles.barValue}>{fmtShort(seconds)}</span>
    </div>
  )
}

const UserStats = ({
  userId,
  name,
  sessions,
}: {
  userId: string
  name: string
  sessions: ReturnType<typeof useSessions>['sessions']
}) => {
  const mine = sessions.filter((s) => s.userId === userId)
  const total = mine.reduce((a, s) => a + s.durationSeconds, 0)

  const bySection = Object.fromEntries(
    SECTIONS.map((s) => [
      s.id,
      mine.filter((ses) => ses.sectionId === s.id).reduce((a, ses) => a + ses.durationSeconds, 0),
    ]),
  )
  const maxSec = Math.max(...Object.values(bySection))

  const secsPerDay: Record<string, number> = {}
  mine.forEach((s) => {
    secsPerDay[s.date] = (secsPerDay[s.date] ?? 0) + s.durationSeconds
  })

  return (
    <div className={styles.userBlock}>
      <div className={styles.userHeader}>
        <div className={styles.avatar}>{name.charAt(0).toUpperCase()}</div>
        <div>
          <div className={styles.userName}>{name}</div>
          <div className={styles.userTotal}>Всего: {fmtShort(total)}</div>
        </div>
      </div>

      <h3 className={styles.subTitle}>Активность</h3>
      <ActivityHeatmap secsPerDay={secsPerDay} />

      <h3 className={styles.subTitle}>По разделам</h3>
      {SECTIONS.map((s) => (
        <SectionBar
          key={s.id}
          label={`${s.icon} ${s.name}`}
          seconds={bySection[s.id]}
          maxSeconds={maxSec}
        />
      ))}
    </div>
  )
}

const StatsPage = () => {
  const { user } = useAuth()
  const { sessions: allSessions } = useAllSessions()

  const otherSessions = allSessions.filter((s) => s.userId !== user?.uid)
  const otherUserIds = [...new Set(otherSessions.map((s) => s.userId))]

  return (
    <div className={styles.root}>
      <h1 className={styles.pageTitle}>Статистика</h1>

      {user && (
        <UserStats
          userId={user.uid}
          name={user.displayName || user.email || 'Я'}
          sessions={allSessions}
        />
      )}

      {otherUserIds.length > 0 && (
        <>
          <div className={styles.divider} />
          <h2 className={styles.sharedTitle}>Другие участники</h2>
          {otherUserIds.map((uid) => {
            const firstSession = otherSessions.find((s) => s.userId === uid)
            return (
              <UserStats
                key={uid}
                userId={uid}
                name={firstSession ? uid.slice(0, 6) + '…' : uid}
                sessions={allSessions}
              />
            )
          })}
        </>
      )}
    </div>
  )
}

export default StatsPage

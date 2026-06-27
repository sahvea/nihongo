import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useSessions } from '../hooks/useSessions'
import { SECTIONS } from '../lib/sections'
import type { SectionId } from '../lib/types'
import { fmt, fmtShort, todayStr } from '../lib/time'
import styles from './TrackerPage.module.css'

const TrackerPage = () => {
  const { user } = useAuth()
  const { sessions, addSession, removeSession } = useSessions(user?.uid)

  const [activeSection, setActiveSection] = useState<SectionId>('kana')
  const [running, setRunning] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startedAtRef = useRef<number>(0)

  const [showManual, setShowManual] = useState(false)
  const [manualSection, setManualSection] = useState<SectionId>('kana')
  const [manualHours, setManualHours] = useState('')
  const [manualMins, setManualMins] = useState('')
  const [manualNote, setManualNote] = useState('')

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const startTimer = () => {
    startedAtRef.current = Date.now() - elapsed * 1000
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000))
    }, 500)
    setRunning(true)
  }

  const stopTimer = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setRunning(false)
    if (elapsed > 0) {
      await addSession(activeSection, elapsed)
      setElapsed(0)
    }
  }

  const switchSection = (id: SectionId) => {
    if (running) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (elapsed > 0) addSession(activeSection, elapsed)
      setElapsed(0)
      setActiveSection(id)
      startedAtRef.current = Date.now()
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startedAtRef.current) / 1000))
      }, 500)
    } else {
      setActiveSection(id)
    }
  }

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const h = parseInt(manualHours || '0', 10)
    const m = parseInt(manualMins || '0', 10)
    const total = h * 3600 + m * 60
    if (total <= 0) return
    await addSession(manualSection, total, manualNote || undefined)
    setManualHours('')
    setManualMins('')
    setManualNote('')
    setShowManual(false)
  }

  const today = todayStr()
  const todaySessions = sessions.filter((s) => s.date === today)
  const todayTotal = todaySessions.reduce((a, s) => a + s.durationSeconds, 0)

  const sectionTotals = Object.fromEntries(
    SECTIONS.map((s) => [
      s.id,
      todaySessions
        .filter((ses) => ses.sectionId === s.id)
        .reduce((a, ses) => a + ses.durationSeconds, 0),
    ]),
  )

  return (
    <div className={styles.root}>
      <div className={styles.totalCard}>
        <div className={styles.totalLabel}>Всего сегодня</div>
        <div className={styles.totalTime}>{fmt(todayTotal + (running ? elapsed : 0))}</div>
        {running && (
          <div className={styles.liveLabel}>
            {SECTIONS.find((s) => s.id === activeSection)?.icon}{' '}
            {SECTIONS.find((s) => s.id === activeSection)?.name} — {fmt(elapsed)}
          </div>
        )}
      </div>

      <div className={styles.sections}>
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            className={`${styles.sectionCard} ${activeSection === s.id ? styles.active : ''}`}
            onClick={() => switchSection(s.id)}
          >
            <span className={styles.sectionIcon}>{s.icon}</span>
            <span className={styles.sectionName}>{s.name}</span>
            <span className={styles.sectionTime}>
              {fmt(sectionTotals[s.id] + (running && activeSection === s.id ? elapsed : 0))}
            </span>
          </button>
        ))}
      </div>

      <div className={styles.controls}>
        <button
          className={`${styles.mainBtn} ${running ? styles.stopBtn : ''}`}
          onClick={running ? stopTimer : startTimer}
        >
          {running ? '⏹ Стоп' : '▶ Старт'}
        </button>
        <button className={styles.manualBtn} onClick={() => setShowManual((v) => !v)}>
          ✏️ Добавить вручную
        </button>
      </div>

      {showManual && (
        <form className={styles.manualForm} onSubmit={handleManualAdd}>
          <h3 className={styles.manualTitle}>Добавить время вручную</h3>
          <div className={styles.manualRow}>
            <select
              value={manualSection}
              onChange={(e) => setManualSection(e.target.value as SectionId)}
              className={styles.select}
            >
              {SECTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.icon} {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.manualRow}>
            <label className={styles.manualInputWrap}>
              <input
                type="number"
                min="0"
                max="23"
                placeholder="0"
                value={manualHours}
                onChange={(e) => setManualHours(e.target.value)}
                className={styles.timeInput}
              />
              <span className={styles.timeUnit}>ч</span>
            </label>
            <label className={styles.manualInputWrap}>
              <input
                type="number"
                min="0"
                max="59"
                placeholder="0"
                value={manualMins}
                onChange={(e) => setManualMins(e.target.value)}
                className={styles.timeInput}
              />
              <span className={styles.timeUnit}>мин</span>
            </label>
          </div>
          <input
            type="text"
            placeholder="Заметка (необязательно)"
            value={manualNote}
            onChange={(e) => setManualNote(e.target.value)}
            className={styles.noteInput}
          />
          <div className={styles.manualActions}>
            <button type="submit" className={styles.addBtn}>
              Добавить
            </button>
            <button type="button" className={styles.cancelBtn} onClick={() => setShowManual(false)}>
              Отмена
            </button>
          </div>
        </form>
      )}

      <div className={styles.log}>
        <h2 className={styles.logTitle}>Сессии сегодня</h2>
        {todaySessions.length === 0 ? (
          <p className={styles.empty}>Нет записей</p>
        ) : (
          <ul className={styles.logList}>
            {todaySessions.map((s) => {
              const sec = SECTIONS.find((x) => x.id === s.sectionId)
              return (
                <li key={s.id} className={styles.logItem}>
                  <span className={styles.logIcon}>{sec?.icon}</span>
                  <span className={styles.logName}>{sec?.name}</span>
                  <span className={styles.logDur}>{fmtShort(s.durationSeconds)}</span>
                  {s.note && <span className={styles.logNote}>{s.note}</span>}
                  <button
                    className={styles.deleteBtn}
                    onClick={() => removeSession(s.id)}
                    title="Удалить"
                  >
                    ×
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

export default TrackerPage

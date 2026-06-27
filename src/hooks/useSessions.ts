import { useEffect, useState } from 'react'
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Session, SectionId } from '../lib/types'
import { todayStr } from '../lib/time'

export const useSessions = (userId: string | undefined) => {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setSessions([])
      setLoading(false)
      return
    }
    const q = query(
      collection(db, 'sessions'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
    )
    return onSnapshot(q, (snap) => {
      setSessions(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Session))
      setLoading(false)
    })
  }, [userId])

  const addSession = async (sectionId: SectionId, durationSeconds: number, note?: string) => {
    if (!userId) return
    await addDoc(collection(db, 'sessions'), {
      userId,
      sectionId,
      durationSeconds,
      date: todayStr(),
      createdAt: Date.now(),
      ...(note ? { note } : {}),
    })
  }

  const removeSession = async (id: string) => {
    await deleteDoc(doc(db, 'sessions', id))
  }

  return { sessions, loading, addSession, removeSession }
}

export const useAllSessions = () => {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'sessions'), orderBy('createdAt', 'desc'))
    return onSnapshot(q, (snap) => {
      setSessions(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Session))
      setLoading(false)
    })
  }, [])

  return { sessions, loading }
}

export type SectionId = 'kana' | 'kanji' | 'anki' | 'grammar' | 'reading' | 'video'

export interface Section {
  id: SectionId
  name: string
  icon: string
}

export interface Session {
  id: string
  userId: string
  sectionId: SectionId
  durationSeconds: number
  date: string // YYYY-MM-DD
  createdAt: number // timestamp ms
  note?: string
}

export interface UserProfile {
  uid: string
  email: string
  displayName: string
}

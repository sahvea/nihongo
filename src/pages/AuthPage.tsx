import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import styles from './AuthPage.module.css'

const AuthPage = () => {
  const { login, register, loginWithGoogle } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        if (!name.trim()) {
          setError('Введите имя')
          setLoading(false)
          return
        }
        await register(email, password, name.trim())
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Ошибка'
      if (
        msg.includes('user-not-found') ||
        msg.includes('wrong-password') ||
        msg.includes('invalid-credential')
      ) {
        setError('Неверный email или пароль')
      } else if (msg.includes('email-already-in-use')) {
        setError('Этот email уже зарегистрирован')
      } else if (msg.includes('weak-password')) {
        setError('Пароль должен быть не менее 6 символов')
      } else {
        setError(msg)
      }
    }
    setLoading(false)
  }

  return (
    <div className={styles.root}>
      <div className={styles.card}>
        <div className={styles.logo}>日本語</div>
        <h1 className={styles.title}>Трекер японского</h1>

        <div className={styles.tabs}>
          <button
            className={mode === 'login' ? styles.tabActive : styles.tab}
            onClick={() => {
              setMode('login')
              setError('')
            }}
          >
            Войти
          </button>
          <button
            className={mode === 'register' ? styles.tabActive : styles.tab}
            onClick={() => {
              setMode('register')
              setError('')
            }}
          >
            Регистрация
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === 'register' && (
            <input
              type="text"
              placeholder="Имя"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" className={styles.submit} disabled={loading}>
            {loading ? '...' : mode === 'login' ? 'Войти' : 'Создать аккаунт'}
          </button>
        </form>

        <div className={styles.divider}>
          <span>или</span>
        </div>

        <button className={styles.googleBtn} onClick={loginWithGoogle} disabled={loading}>
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"
            />
            <path
              fill="#34A853"
              d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
            />
            <path
              fill="#FBBC05"
              d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z"
            />
            <path
              fill="#EA4335"
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58Z"
            />
          </svg>
          Войти через Google
        </button>
      </div>
    </div>
  )
}

export default AuthPage

import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import styles from './Layout.module.css'

const Layout = () => {
  const { user, logout } = useAuth()

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.logo}>🇯🇵 日本語</span>
          <div className={styles.headerRight}>
            <span className={styles.userName}>{user?.displayName || user?.email}</span>
            <button className={styles.logoutBtn} onClick={logout}>
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <Outlet />
      </main>

      <nav className={styles.nav}>
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? `${styles.navItem} ${styles.navActive}` : styles.navItem
          }
        >
          <span className={styles.navIcon}>⏱</span>
          <span className={styles.navLabel}>Трекер</span>
        </NavLink>
        <NavLink
          to="/stats"
          className={({ isActive }) =>
            isActive ? `${styles.navItem} ${styles.navActive}` : styles.navItem
          }
        >
          <span className={styles.navIcon}>📊</span>
          <span className={styles.navLabel}>Статистика</span>
        </NavLink>
      </nav>
    </div>
  )
}

export default Layout

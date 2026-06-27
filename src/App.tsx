import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import AuthPage from './pages/AuthPage'
import TrackerPage from './pages/TrackerPage'
import StatsPage from './pages/StatsPage'
import Layout from './components/Layout'

const ProtectedRoutes = () => {
  const { user, loading } = useAuth()
  if (loading)
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontSize: '2rem',
        }}
      >
        🇯🇵
      </div>
    )
  if (!user) return <AuthPage />
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<TrackerPage />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

const App = () => (
  <BrowserRouter basename="/nihongo">
    <AuthProvider>
      <ProtectedRoutes />
    </AuthProvider>
  </BrowserRouter>
)

export default App

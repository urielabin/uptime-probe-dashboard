import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage.js'
import { LoginPage } from './pages/LoginPage.js'
import { SignupPage } from './pages/SignupPage.js'
import { DashboardPage } from './pages/DashboardPage.js'
import { MonitorDetailPage } from './pages/MonitorDetailPage.js'
import { ApiKeysPage } from './pages/ApiKeysPage.js'
import { ProtectedRoute } from './components/auth/ProtectedRoute.js'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/:configName"
          element={
            <ProtectedRoute>
              <MonitorDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/api-keys"
          element={
            <ProtectedRoute>
              <ApiKeysPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

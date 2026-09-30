import { Routes, Route, Navigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { supabase } from "./supabase"
import Login from "./components/Login"
import Dashboard from "./components/Dashboard"
import ProjectsManager from "./components/ProjectsManager"
import SkillsManager from "./components/SkillsManager"
import AboutEditor from "./components/AboutEditor"
import ContactEditor from "./components/ContactEditor"

function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading...</div>
  if (!session) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/dashboard/projects" element={<ProtectedRoute><ProjectsManager /></ProtectedRoute>} />
      <Route path="/dashboard/skills" element={<ProtectedRoute><SkillsManager /></ProtectedRoute>} />
      <Route path="/dashboard/about" element={<ProtectedRoute><AboutEditor /></ProtectedRoute>} />
      <Route path="/dashboard/contact" element={<ProtectedRoute><ContactEditor /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

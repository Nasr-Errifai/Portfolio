import { Routes, Route, Navigate } from "react-router-dom"
import ProtectedRoute from "./ProtectedRoute"
import Login from "./components/Login"
import Dashboard from "./components/Dashboard"
import ProjectsManager from "./components/ProjectsManager"
import SkillsManager from "./components/SkillsManager"
import AboutEditor from "./components/AboutEditor"
import ContactEditor from "./components/ContactEditor"

export default function AdminLayout() {
  return (
    <Routes>
      <Route index element={<Login />} />
      <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="dashboard/projects" element={<ProtectedRoute><ProjectsManager /></ProtectedRoute>} />
      <Route path="dashboard/skills" element={<ProtectedRoute><SkillsManager /></ProtectedRoute>} />
      <Route path="dashboard/about" element={<ProtectedRoute><AboutEditor /></ProtectedRoute>} />
      <Route path="dashboard/contact" element={<ProtectedRoute><ContactEditor /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  )
}

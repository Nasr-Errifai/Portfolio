import { Routes, Route, Navigate } from "react-router-dom"
import AuthProvider from "./AuthProvider"
import RequireAdmin from "./RequireAdmin"
import AdminShell from "./AdminShell"
import Login from "./components/Login"
import Dashboard from "./components/Dashboard"
import ProjectsManager from "./components/ProjectsManager"
import SkillsManager from "./components/SkillsManager"
import AboutEditor from "./components/AboutEditor"
import ContactEditor from "./components/ContactEditor"

export default function AdminLayout() {
  return (
    <AuthProvider>
      <Routes>
        <Route index element={<Login />} />
        <Route
          path="dashboard"
          element={
            <RequireAdmin>
              <AdminShell />
            </RequireAdmin>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<ProjectsManager />} />
          <Route path="skills" element={<SkillsManager />} />
          <Route path="about" element={<AboutEditor />} />
          <Route path="contact" element={<ContactEditor />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AuthProvider>
  )
}

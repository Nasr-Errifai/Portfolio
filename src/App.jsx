import { lazy, Suspense } from "react"
import { Routes, Route, Navigate } from "react-router-dom"
import Home from "./pages/Home"

const AdminLayout = lazy(() => import("./admin/AdminLayout"))

function Loading() {
  return <div className="flex min-h-screen items-center justify-center bg-bg text-gray-400">Loading...</div>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<Loading />}>
            <AdminLayout />
          </Suspense>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

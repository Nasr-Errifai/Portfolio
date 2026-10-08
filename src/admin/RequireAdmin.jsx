import { Navigate, Link } from "react-router-dom"
import { useAuth } from "./authContext"

function Loading() {
  return (
    <div role="status" className="flex min-h-screen items-center justify-center text-gray-400">
      Loading…
    </div>
  )
}

function Blocked({ message }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="w-full max-w-sm rounded-xl border border-gray-800 bg-surface p-8 text-center">
        <h1 className="mb-2 text-lg font-bold">Access denied</h1>
        <p className="mb-6 text-sm text-red-400">{message}</p>
        <Link
          to="/admin"
          className="text-sm text-accent underline underline-offset-4 hover:text-accent-dim"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  )
}

// The single gate in front of every admin page.
export default function RequireAdmin({ children }) {
  const { loading, session, isAdmin, blocked } = useAuth()

  // Checked before the session redirect, otherwise signing out would
  // clear the session and hide the message before it can be read.
  if (blocked) return <Blocked message={blocked.message} />
  if (loading) return <Loading />
  if (!session) return <Navigate to="/admin" replace />
  if (!isAdmin) return <Loading />
  return children
}

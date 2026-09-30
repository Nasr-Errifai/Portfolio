import { useState, useEffect } from "react"
import { Navigate } from "react-router-dom"
import { supabase } from "../supabase"

function Loading() {
  return <div className="flex min-h-screen items-center justify-center text-gray-400">Loading...</div>
}

function Blocked({ message }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="w-full max-w-sm rounded-xl border border-gray-800 bg-surface p-8 text-center">
        <h1 className="mb-2 text-lg font-bold">Access denied</h1>
        <p className="text-sm text-red-400">{message}</p>
      </div>
    </div>
  )
}

export default function ProtectedRoute({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [blocked, setBlocked] = useState(null)

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

  useEffect(() => {
    if (loading || !session) return
    let active = true
    setIsAdmin(false)
    setBlocked(null)
    // Not called inside onAuthStateChange: awaiting a Supabase call
    // from that callback deadlocks the client.
    supabase.rpc("is_admin").then(({ data, error }) => {
      if (!active) return
      if (error) {
        setBlocked({ message: error.message, signOut: false })
        return
      }
      if (!data) {
        setBlocked({ message: "This account doesn't have access", signOut: true })
        return
      }
      setIsAdmin(true)
    })
    return () => { active = false }
  }, [session, loading])

  useEffect(() => {
    if (blocked?.signOut) supabase.auth.signOut()
  }, [blocked])

  // Checked before the session redirect, otherwise signing out would
  // clear the session and hide the message before it can be read.
  if (blocked) return <Blocked message={blocked.message} />
  if (loading) return <Loading />
  if (!session) return <Navigate to="/admin" replace />
  if (!isAdmin) return <Loading />
  return children
}

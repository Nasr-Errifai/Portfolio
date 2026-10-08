import { useEffect, useState } from "react"
import { supabase } from "../supabase"
import { run } from "../lib/query"
import { AuthContext } from "./authContext"

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [blocked, setBlocked] = useState(null)

  useEffect(() => {
    let active = true
    run("auth.getSession", () => supabase.auth.getSession()).then((res) => {
      if (!active) return
      if (res.ok) {
        setSession(res.data?.session ?? null)
      } else {
        // Surfaced instead of swallowed: a silent null session would make
        // Login and RequireAdmin bounce the admin between each other.
        setBlocked({ message: res.error, signOut: false })
      }
      setLoading(false)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  // Keyed on the user, not the session object: a token refresh hands over a
  // new session every hour, and that must not re-run the check or blank the
  // screen under an open form.
  const userId = session?.user?.id ?? null

  useEffect(() => {
    if (loading) return
    if (!userId) {
      // blocked is left alone, so the message that triggered a sign-out
      // stays readable instead of vanishing with the session.
      setIsAdmin(false)
      return
    }

    let active = true
    setBlocked(null)
    setIsAdmin(false)
    // Not called inside onAuthStateChange: awaiting a Supabase call
    // from that callback deadlocks the client.
    run("rpc.is_admin", () => supabase.rpc("is_admin")).then((res) => {
      if (!active) return
      if (!res.ok) {
        setBlocked({ message: res.error, signOut: false })
        return
      }
      if (!res.data) {
        setBlocked({ message: "This account doesn't have access", signOut: true })
        return
      }
      setIsAdmin(true)
    })
    return () => {
      active = false
    }
    // Keyed on userId rather than the session object on purpose: the object
    // changes on every token refresh, and that must not re-run this check or
    // blank a screen under an open form.
  }, [loading, userId])

  // A signed-in account that is not an admin is signed straight back out, so
  // it cannot sit in front of a dashboard it will never reach. blocked keeps
  // its identity while the session clears, so this does not fire twice and
  // the message stays on screen.
  useEffect(() => {
    if (blocked?.signOut) run("auth.signOut (no access)", () => supabase.auth.signOut())
  }, [blocked])

  const value = { session, loading, isAdmin, blocked }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

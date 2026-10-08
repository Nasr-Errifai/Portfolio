import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { FcGoogle } from "react-icons/fc"
import { supabase } from "../../supabase"
import { run } from "../../lib/query"
import { useAuth } from "../authContext"

export default function Login() {
  const [error, setError] = useState("")
  const navigate = useNavigate()
  // A failed first session lookup used to look identical to "signed out",
  // which bounced this page and the dashboard guard in a loop.
  const { blocked } = useAuth()

  useEffect(() => {
    run("auth.getSession", () => supabase.auth.getSession()).then((res) => {
      if (res.ok && res.data?.session) {
        navigate("/admin/dashboard", { replace: true })
      }
    })
  }, [navigate])

  const signIn = async () => {
    setError("")
    const res = await run("auth.signInWithOAuth", () =>
      supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/admin/dashboard` },
      })
    )
    if (!res.ok) setError(res.error)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="w-full max-w-sm rounded-xl border border-gray-800 bg-surface p-8 text-center">
        <h1 className="mb-2 text-2xl font-bold">&lt;NE /&gt;</h1>
        <p className="mb-8 text-sm text-gray-400">Portfolio Admin Dashboard</p>
        <button
          onClick={signIn}
          className="flex w-full items-center justify-center gap-3 rounded-lg bg-white px-6 py-3 text-sm font-medium text-black transition-all hover:bg-gray-200"
        >
          <FcGoogle size={20} /> Sign in with Google
        </button>
        {(error || blocked?.message) && (
          <p role="alert" className="mt-4 text-sm text-red-400">
            {error || blocked.message}
          </p>
        )}
      </div>
    </div>
  )
}

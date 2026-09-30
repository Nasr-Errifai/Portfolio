import { useState, useEffect } from "react"
import { supabase } from "../supabase"
import { useNavigate } from "react-router-dom"
import { FcGoogle } from "react-icons/fc"

export default function Login() {
  const [error, setError] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard", { replace: true })
    })
  }, [navigate])

  const signIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" })
    if (error) setError(error.message)
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
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      </div>
    </div>
  )
}

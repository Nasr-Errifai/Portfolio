import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../../supabase"
import { run } from "../../lib/query"
import { checkFields, focusField } from "../../lib/validate"
import { useAuth } from "../authContext"

const emptyForm = { email: "", password: "" }

// One list drives the inputs and the checks, so a field can never be
// rendered without its rule.
const FIELDS = [
  { key: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
  { key: "password", label: "Password", type: "password", required: true, autoComplete: "current-password" },
]

export default function Login() {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState("")
  const [fieldError, setFieldError] = useState(null)
  const [signingIn, setSigningIn] = useState(false)
  const navigate = useNavigate()
  // A failed first session lookup used to look identical to "signed out",
  // which bounced this page and the dashboard guard in a loop.
  const { blocked, session, loading, signingOut, retryAccessCheck } = useAuth()

  // AuthProvider is the only one that reads storage, so this page never
  // looks for a session itself: two lookups could disagree and bounce the
  // admin between /admin and /admin/dashboard.
  useEffect(() => {
    // Not while blocked: an is_admin() failure keeps the session alive, and
    // navigating would lock the admin into Blocked with no way back here.
    if (session && !blocked) navigate("/admin/dashboard", { replace: true })
  }, [session, blocked, navigate])

  // Focus waits for the commit, so aria-describedby is already on the input
  // when the screen reader announces it.
  useEffect(() => {
    if (fieldError) focusField(`login-${fieldError.key}`)
  }, [fieldError])

  const handleSignIn = async (e) => {
    e.preventDefault()
    if (signingIn || signingOut) return
    setError("")

    const problem = checkFields(FIELDS, form)
    if (problem) {
      setFieldError(problem)
      return
    }
    setFieldError(null)

    setSigningIn(true)
    // Validate after trim, so the request carries the checked values.
    const res = await run("auth.signInWithPassword", () =>
      supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      })
    )
    setSigningIn(false)

    if (!res.ok) {
      // The admin sees the real message: "Invalid login credentials" is
      // useful here, and it is never shown to a visitor. Focus goes back to
      // the email field, because the failed submit disabled the button that
      // had it.
      setError(res.error)
      focusField("login-email")
      return
    }

    // A previous is_admin() failure sticks until something re-runs it, and
    // re-signing-in keeps the same user id, so the check has to be nudged.
    retryAccessCheck()
  }

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setFieldError(null)
    setError("")
  }

  if (loading) {
    return (
      <div role="status" className="flex min-h-screen items-center justify-center text-gray-400">
        Loading…
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6">
      <div className="w-full max-w-sm rounded-xl border border-gray-800 bg-surface p-8">
        <h1 className="mb-2 text-center text-2xl font-bold">&lt;NE /&gt;</h1>
        <p className="mb-8 text-center text-sm text-gray-400">Portfolio Admin Dashboard</p>

        <form onSubmit={handleSignIn} noValidate className="space-y-5">
          {FIELDS.map(({ key, label, type, required, autoComplete }) => {
            const message = fieldError?.key === key ? fieldError.message : ""
            const errorId = `login-${key}-error`
            return (
              <div key={key}>
                <label className="mb-2 block text-sm text-gray-400" htmlFor={`login-${key}`}>
                  {label}
                </label>
                <input
                  id={`login-${key}`}
                  name={key}
                  type={type}
                  value={form[key]}
                  onChange={(e) => setField(key, e.target.value)}
                  autoComplete={autoComplete}
                  required={required}
                  spellCheck={false}
                  aria-invalid={Boolean(message)}
                  aria-describedby={message ? errorId : undefined}
                  className="w-full rounded-lg border border-gray-700 bg-bg px-4 py-2 text-sm focus:border-accent focus:outline-none"
                />
                {message && (
                  <p id={errorId} role="alert" className="mt-1 text-sm text-red-400">
                    {message}
                  </p>
                )}
              </div>
            )
          })}

          <button
            type="submit"
            disabled={signingIn || signingOut}
            className="w-full rounded-lg bg-accent px-6 py-3 text-sm font-medium text-black transition-all hover:bg-accent-dim disabled:cursor-not-allowed disabled:opacity-50"
          >
            {signingOut ? "Signing out…" : signingIn ? "Signing in…" : "Sign in"}
          </button>

          {/* Two slots on purpose: a wrong password must not hide
              "This account doesn't have access", and typing must not
              erase it. */}
          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}
          {blocked?.message && (
            <p role="alert" className="text-sm text-red-400">
              {blocked.message}
            </p>
          )}
        </form>
      </div>
    </div>
  )
}

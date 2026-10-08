import { useState, useEffect } from "react"
import { supabase } from "../../supabase"
import { run } from "../../lib/query"
import { checkFields, focusField } from "../../lib/validate"
import Sidebar from "./Sidebar"

const COLUMNS = "email, github, linkedin, resume_url, message"

const emptyForm = { email: "", github: "", linkedin: "", resume_url: "", message: "" }

// One list drives both the inputs and the checks, so a field can never be
// rendered without its rule.
const FIELDS = [
  { key: "email", label: "Email", placeholder: "errnasr@gmail.com…", type: "email" },
  { key: "github", label: "GitHub URL", placeholder: "https://github.com/yourhandle…", type: "url" },
  { key: "linkedin", label: "LinkedIn URL", placeholder: "https://linkedin.com/in/yourhandle…", type: "url" },
  { key: "resume_url", label: "Resume URL", placeholder: "https://example.com/resume.pdf…", type: "url" },
  { key: "message", label: "Call-to-action message", textarea: true, placeholder: "I'm currently open to internship opportunities…" },
]

export default function ContactEditor() {
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [saveError, setSaveError] = useState("")
  const [fieldError, setFieldError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let active = true
    // Only this editor's own columns, so the bio and photo are never
    // loaded here and can never be written back over.
    run("content.select (contact editor)", () =>
      supabase.from("content").select(COLUMNS).single()
    ).then((res) => {
      if (!active) return
      if (res.ok) {
        setForm({
          email: res.data?.email || "",
          github: res.data?.github || "",
          linkedin: res.data?.linkedin || "",
          resume_url: res.data?.resume_url || "",
          message: res.data?.message || "",
        })
        setLoadError("")
      } else {
        setLoadError(res.error)
      }
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  // Focus waits for the commit, so aria-describedby is already on the input
  // when the screen reader announces it.
  useEffect(() => {
    if (fieldError) focusField(`contact-${fieldError.key}`)
  }, [fieldError])

  const handleSave = async (e) => {
    e.preventDefault()
    if (saving) return
    setSaveError("")
    setSaved(false)

    const problem = checkFields(FIELDS, form)
    if (problem) {
      setFieldError(problem)
      return
    }
    setFieldError(null)

    // Validate after trim, so send the same values that were checked.
    const data = {}
    for (const key of Object.keys(emptyForm)) {
      data[key] = String(form[key] ?? "").trim()
    }

    setSaving(true)

    // content holds exactly one row (sql/02_content_single_row.sql), so a
    // single upsert is enough. Only these five columns are sent, so bio and
    // photo_url are never touched from here.
    const res = await run("content.upsert (contact)", () =>
      supabase
        .from("content")
        .upsert({ id: 1, ...data }, { onConflict: "id" })
    )

    setSaving(false)

    // Nothing is cleared on failure, so the typed values are never lost.
    if (!res.ok) {
      setSaveError(res.error)
      return
    }

    setSaved(true)
  }

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setFieldError(null)
    setSaved(false)
  }

  // Saving while the load is still running would send empty values over the
  // real links, so the button stays disabled until the data arrived.
  const disabled = loading || saving || loadError !== ""

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="mb-8 text-2xl font-bold">Contact Section</h1>

        {loadError && (
          <p role="alert" className="mb-6 text-sm text-red-400">
            {loadError}
          </p>
        )}

        <form onSubmit={handleSave} noValidate className="max-w-xl space-y-5">
          {FIELDS.map(({ key, label, placeholder, type, textarea }) => {
            const error = fieldError?.key === key ? fieldError.message : ""
            const errorId = `contact-${key}-error`
            const shared = {
              id: `contact-${key}`,
              name: key,
              value: form[key],
              onChange: (e) => setField(key, e.target.value),
              placeholder,
              autoComplete: "off",
              "aria-invalid": Boolean(error),
              "aria-describedby": error ? errorId : undefined,
              className:
                "w-full rounded-lg border border-gray-700 bg-bg px-4 py-2 text-sm focus:border-accent focus:outline-none",
            }
            return (
              <div key={key}>
                <label className="mb-2 block text-sm text-gray-400" htmlFor={`contact-${key}`}>{label}</label>
                {textarea ? (
                  <textarea {...shared} rows={3} className={`${shared.className} py-3`} />
                ) : (
                  <input {...shared} type={type || "text"} spellCheck={false} />
                )}
                {error && (
                  <p id={errorId} role="alert" className="mt-1 text-sm text-red-400">
                    {error}
                  </p>
                )}
              </div>
            )
          })}
          <button
            type="submit"
            disabled={disabled}
            className="rounded-lg bg-accent px-6 py-2 text-sm font-medium text-black transition-all hover:bg-accent-dim disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Loading…" : saving ? "Saving…" : "Save Changes"}
          </button>
          {saveError && (
            <p role="alert" className="text-sm text-red-400">
              {saveError}
            </p>
          )}
          <p aria-live="polite" role="status" className={saved && !saveError ? "text-sm text-green-400" : "sr-only"}>
            {saved && !saveError ? "Saved!" : ""}
          </p>
        </form>
      </main>
    </div>
  )
}

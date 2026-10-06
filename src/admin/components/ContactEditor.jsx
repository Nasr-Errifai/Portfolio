import { useState, useEffect } from "react"
import { supabase } from "../../supabase"
import { run } from "../../lib/query"
import Sidebar from "./Sidebar"

const COLUMNS = "email, github, linkedin, resume_url, message"

const emptyForm = { email: "", github: "", linkedin: "", resume_url: "", message: "" }

export default function ContactEditor() {
  const [form, setForm] = useState(emptyForm)
  const [loadError, setLoadError] = useState("")
  const [saveError, setSaveError] = useState("")
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
    })
    return () => {
      active = false
    }
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaveError("")
    setSaved(false)

    // content holds exactly one row (sql/02_content_single_row.sql), so a
    // single upsert is enough. Only these five columns are sent, so bio and
    // photo_url are never touched from here.
    const res = await run("content.upsert (contact)", () =>
      supabase
        .from("content")
        .upsert({ id: 1, ...form }, { onConflict: "id" })
    )

    // Nothing is cleared on failure, so the typed values are never lost.
    if (!res.ok) {
      setSaveError(res.error)
      return
    }

    setSaved(true)
  }

  const fields = [
    { key: "email", label: "Email", placeholder: "errnasr@gmail.com" },
    { key: "github", label: "GitHub URL", placeholder: "https://github.com/yourhandle" },
    { key: "linkedin", label: "LinkedIn URL", placeholder: "https://linkedin.com/in/yourhandle" },
    { key: "resume_url", label: "Resume URL", placeholder: "https://example.com/resume.pdf" },
    { key: "message", label: "Call-to-action message", placeholder: "I'm currently open to internship opportunities..." },
  ]

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

        <form onSubmit={handleSave} className="max-w-xl space-y-5">
          {fields.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="mb-2 block text-sm text-gray-400" htmlFor={`contact-${key}`}>{label}</label>
              {key === "message" ? (
                <textarea
                  id={`contact-${key}`}
                  className="w-full rounded-lg border border-gray-700 bg-bg px-4 py-3 text-sm focus:border-accent focus:outline-none"
                  rows={3}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                />
              ) : (
                <input
                  id={`contact-${key}`}
                  className="w-full rounded-lg border border-gray-700 bg-bg px-4 py-2 text-sm focus:border-accent focus:outline-none"
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                />
              )}
            </div>
          ))}
          <button type="submit" className="rounded-lg bg-accent px-6 py-2 text-sm font-medium text-black transition-all hover:bg-accent-dim">
            Save Changes
          </button>
          {saveError && (
            <p role="alert" className="text-sm text-red-400">
              {saveError}
            </p>
          )}
          {saved && !saveError && (
            <p className="text-sm text-green-400">Saved!</p>
          )}
        </form>
      </main>
    </div>
  )
}

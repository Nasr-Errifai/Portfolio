import { useState, useEffect } from "react"
import { supabase } from "../supabase"
import Sidebar from "./Sidebar"

export default function ContactEditor() {
  const [form, setForm] = useState({ email: "", github: "", linkedin: "", resume_url: "", message: "" })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.from("content").select("*").single().then(({ data }) => {
      if (data) setForm(data)
    })
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    const { data: existing } = await supabase.from("content").select("id").single()
    if (existing) {
      await supabase.from("content").update(form).eq("id", existing.id)
    } else {
      await supabase.from("content").insert([form])
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
        <form onSubmit={handleSave} className="max-w-xl space-y-5">
          {fields.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="mb-2 block text-sm text-gray-400">{label}</label>
              {key === "message" ? (
                <textarea className="w-full rounded-lg border border-gray-700 bg-bg px-4 py-3 text-sm focus:border-accent focus:outline-none" rows={3} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} />
              ) : (
                <input className="w-full rounded-lg border border-gray-700 bg-bg px-4 py-2 text-sm focus:border-accent focus:outline-none" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} />
              )}
            </div>
          ))}
          <button type="submit" className="rounded-lg bg-accent px-6 py-2 text-sm font-medium text-black transition-all hover:bg-accent-dim">Save Changes</button>
          {saved && <span className="ml-4 text-sm text-green-400">Saved!</span>}
        </form>
      </main>
    </div>
  )
}

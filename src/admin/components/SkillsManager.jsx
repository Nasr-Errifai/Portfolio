import { useState, useEffect } from "react"
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi"
import { supabase } from "../../supabase"
import { run } from "../../lib/query"
import Sidebar from "./Sidebar"

const emptyForm = { name: "", category: "" }

export default function SkillsManager() {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [saveError, setSaveError] = useState("")
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const load = () =>
    run("skills.select (admin)", () =>
      supabase.from("skills").select("*").order("category")
    ).then((res) => {
      if (res.ok) {
        setSkills(res.data || [])
        setLoadError("")
      } else {
        setLoadError(res.error)
      }
      setLoading(false)
    })

  useEffect(() => {
    load()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaveError("")

    const res = editingId
      ? await run("skills.update", () =>
          supabase.from("skills").update(form).eq("id", editingId)
        )
      : await run("skills.insert", () => supabase.from("skills").insert([form]))

    // Keep the form open and the typed values intact so nothing is lost.
    if (!res.ok) {
      setSaveError(res.error)
      return
    }

    setForm(emptyForm)
    setEditingId(null)
    setShowForm(false)
    load()
  }

  const handleEdit = (s) => {
    setForm({ name: s.name, category: s.category })
    setEditingId(s.id)
    setSaveError("")
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm("Delete this skill?")) return
    setSaveError("")
    const res = await run("skills.delete", () =>
      supabase.from("skills").delete().eq("id", id)
    )
    if (!res.ok) {
      setSaveError(res.error)
      return
    }
    load()
  }

  const grouped = skills.reduce((acc, s) => {
    const cat = s.category || "Other"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(s)
    return acc
  }, {})

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Skills</h1>
          <button
            onClick={() => {
              setShowForm(!showForm)
              setForm(emptyForm)
              setEditingId(null)
              setSaveError("")
            }}
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black transition-all hover:bg-accent-dim"
          >
            <FiPlus /> {showForm ? "Cancel" : "Add Skill"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 rounded-xl border border-gray-800 bg-surface p-6 space-y-4">
            <input className="w-full rounded-lg border border-gray-700 bg-bg px-4 py-2 text-sm focus:border-accent focus:outline-none" placeholder="Skill name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className="w-full rounded-lg border border-gray-700 bg-bg px-4 py-2 text-sm focus:border-accent focus:outline-none" placeholder="Category (e.g. Languages, Frameworks, Tools)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required />
            <button type="submit" className="rounded-lg bg-accent px-6 py-2 text-sm font-medium text-black transition-all hover:bg-accent-dim">
              {editingId ? "Update" : "Add"} Skill
            </button>
            {saveError && (
              <p role="alert" className="text-sm text-red-400">
                {saveError}
              </p>
            )}
          </form>
        )}

        {loading ? (
          <p className="text-sm text-gray-500">Loading skills...</p>
        ) : loadError ? (
          <p role="alert" className="text-sm text-red-400">
            {loadError}
          </p>
        ) : Object.keys(grouped).length === 0 ? (
          <p className="text-gray-500 italic">No skills yet.</p>
        ) : (
          Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="mb-6">
              <h3 className="mb-3 font-mono text-sm text-accent">{category}</h3>
              <div className="space-y-2">
                {items.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border border-gray-800 bg-surface p-3">
                    <span className="text-sm">{s.name}</span>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(s)} aria-label={`Edit ${s.name}`} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-800 hover:text-accent"><FiEdit2 size={14} /></button>
                      <button onClick={() => handleDelete(s.id)} aria-label={`Delete ${s.name}`} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-800 hover:text-red-400"><FiTrash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        {!showForm && saveError && (
          <p role="alert" className="mt-6 text-sm text-red-400">
            {saveError}
          </p>
        )}
      </main>
    </div>
  )
}

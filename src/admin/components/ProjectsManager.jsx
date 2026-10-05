import { useState, useEffect } from "react"
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi"
import { supabase } from "../../supabase"
import { run } from "../../lib/query"
import Sidebar from "./Sidebar"

const emptyForm = { title: "", description: "", tech: "", image: "", live_url: "", repo_url: "" }

export default function ProjectsManager() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [saveError, setSaveError] = useState("")
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const load = () =>
    run("projects.select (admin)", () =>
      supabase.from("projects").select("*").order("created_at", { ascending: false })
    ).then((res) => {
      if (res.ok) {
        setProjects(res.data || [])
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
    const data = {
      ...form,
      tech: form.tech.split(",").map((t) => t.trim()).filter(Boolean),
    }

    const res = editingId
      ? await run("projects.update", () =>
          supabase.from("projects").update(data).eq("id", editingId)
        )
      : await run("projects.insert", () =>
          supabase.from("projects").insert([data])
        )

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

  const handleEdit = (p) => {
    setForm({ ...p, tech: (p.tech || []).join(", ") })
    setEditingId(p.id)
    setSaveError("")
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm("Delete this project?")) return
    setSaveError("")
    const res = await run("projects.delete", () =>
      supabase.from("projects").delete().eq("id", id)
    )
    if (!res.ok) {
      setSaveError(res.error)
      return
    }
    load()
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Projects</h1>
          <button
            onClick={() => {
              setShowForm(!showForm)
              setForm(emptyForm)
              setEditingId(null)
              setSaveError("")
            }}
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black transition-all hover:bg-accent-dim"
          >
            <FiPlus /> {showForm ? "Cancel" : "Add Project"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="mb-8 rounded-xl border border-gray-800 bg-surface p-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input className="rounded-lg border border-gray-700 bg-bg px-4 py-2 text-sm focus:border-accent focus:outline-none" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              <input className="rounded-lg border border-gray-700 bg-bg px-4 py-2 text-sm focus:border-accent focus:outline-none" placeholder="Image URL (optional)" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
            </div>
            <textarea className="w-full rounded-lg border border-gray-700 bg-bg px-4 py-2 text-sm focus:border-accent focus:outline-none" rows={3} placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            <div className="grid gap-4 sm:grid-cols-2">
              <input className="rounded-lg border border-gray-700 bg-bg px-4 py-2 text-sm focus:border-accent focus:outline-none" placeholder="Tech tags (comma separated)" value={form.tech} onChange={(e) => setForm({ ...form, tech: e.target.value })} />
              <input className="rounded-lg border border-gray-700 bg-bg px-4 py-2 text-sm focus:border-accent focus:outline-none" placeholder="Live URL" value={form.live_url} onChange={(e) => setForm({ ...form, live_url: e.target.value })} />
            </div>
            <input className="w-full rounded-lg border border-gray-700 bg-bg px-4 py-2 text-sm focus:border-accent focus:outline-none" placeholder="Repo URL" value={form.repo_url} onChange={(e) => setForm({ ...form, repo_url: e.target.value })} />
            <button type="submit" className="rounded-lg bg-accent px-6 py-2 text-sm font-medium text-black transition-all hover:bg-accent-dim">
              {editingId ? "Update" : "Add"} Project
            </button>
            {saveError && (
              <p role="alert" className="text-sm text-red-400">
                {saveError}
              </p>
            )}
          </form>
        )}

        {loading ? (
          <p className="text-sm text-gray-500">Loading projects...</p>
        ) : loadError ? (
          <p role="alert" className="text-sm text-red-400">
            {loadError}
          </p>
        ) : projects.length === 0 ? (
          <p className="text-gray-500 italic">No projects yet.</p>
        ) : (
          <div className="space-y-3">
            {projects.map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-gray-800 bg-surface p-4">
                <div className="flex-1">
                  <h3 className="font-semibold">{p.title}</h3>
                  <p className="text-sm text-gray-400 truncate">{p.description}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button onClick={() => handleEdit(p)} aria-label={`Edit ${p.title}`} className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-accent"><FiEdit2 size={16} /></button>
                  <button onClick={() => handleDelete(p.id)} aria-label={`Delete ${p.title}`} className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-red-400"><FiTrash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
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

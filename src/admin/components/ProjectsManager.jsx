import { useState, useEffect } from "react"
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi"
import { supabase } from "../../supabase"
import { run } from "../../lib/query"
import { checkFields, focusField } from "../../lib/validate"

const emptyForm = { title: "", description: "", tech: "", image: "", live_url: "", repo_url: "" }

// This one list drives the inputs, their labels and the checks, so a field
// can never be rendered without its rule.
const FIELDS = [
  { key: "title", label: "Title", required: true, placeholder: "EventsMa…" },
  { key: "image", label: "Image URL", type: "url", placeholder: "https://example.com/preview.png…" },
  { key: "description", label: "Description", required: true, textarea: true, wide: true, placeholder: "What it does, in one or two sentences…" },
  { key: "tech", label: "Tech tags", placeholder: "React, Supabase, Tailwind…" },
  { key: "live_url", label: "Live URL", type: "url", placeholder: "https://yourapp.com…" },
  { key: "repo_url", label: "Repo URL", type: "url", wide: true, placeholder: "https://github.com/you/repo…" },
]

// Only real columns, so id and created_at never ride along into an insert.
const COLUMNS = FIELDS.map((field) => field.key)

function Field({ field, value, error, onChange }) {
  const id = `project-${field.key}`
  const errorId = `${id}-error`
  const shared = {
    id,
    name: field.key,
    value,
    onChange,
    placeholder: field.placeholder,
    autoComplete: "off",
    required: Boolean(field.required),
    "aria-invalid": Boolean(error),
    "aria-describedby": error ? errorId : undefined,
    className:
      "w-full rounded-lg border border-gray-700 bg-bg px-4 py-2 text-sm focus:border-accent focus:outline-none",
  }

  return (
    <div className={field.wide ? "sm:col-span-2" : undefined}>
      <label htmlFor={id} className="mb-2 block text-sm text-gray-400">
        {field.label}
      </label>
      {field.textarea ? (
        <textarea {...shared} rows={3} />
      ) : (
        <input {...shared} type={field.type || "text"} />
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}

export default function ProjectsManager() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [saveError, setSaveError] = useState("")
  const [fieldError, setFieldError] = useState(null)
  const [saving, setSaving] = useState(false)
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

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setFieldError(null)
  }

  // Focus waits for the commit, so aria-describedby is already on the input
  // when the screen reader announces it.
  useEffect(() => {
    if (fieldError) focusField(`project-${fieldError.key}`)
  }, [fieldError])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (saving) return
    setSaveError("")

    const problem = checkFields(FIELDS, form)
    if (problem) {
      setFieldError(problem)
      return
    }

    const data = {}
    for (const key of COLUMNS) {
      data[key] = String(form[key] ?? "").trim()
    }
    data.tech = form.tech
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    setSaving(true)
    const res = editingId
      ? await run("projects.update", () =>
          supabase.from("projects").update(data).eq("id", editingId)
        )
      : await run("projects.insert", () =>
          supabase.from("projects").insert([data])
        )
    setSaving(false)

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
    if (saving) return
    setForm({
      title: p.title || "",
      description: p.description || "",
      tech: (p.tech || []).join(", "),
      image: p.image || "",
      live_url: p.live_url || "",
      repo_url: p.repo_url || "",
    })
    setEditingId(p.id)
    setSaveError("")
    setFieldError(null)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (saving) return
    if (!confirm("Delete this project?")) return
    setSaveError("")
    // saving also covers the delete, so the buttons and the form cannot
    // start a second write while this one is in flight.
    setSaving(true)
    const res = await run("projects.delete", () =>
      supabase.from("projects").delete().eq("id", id)
    )
    setSaving(false)
    if (!res.ok) {
      setSaveError(res.error)
      return
    }
    load()
  }

  const errorFor = (key) => (fieldError?.key === key ? fieldError.message : "")

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <button
          onClick={() => {
            setShowForm(!showForm)
            setForm(emptyForm)
            setEditingId(null)
            setSaveError("")
            setFieldError(null)
          }}
          disabled={saving || loading}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black transition-all hover:bg-accent-dim disabled:cursor-not-allowed disabled:opacity-50"
        >
          <FiPlus /> {showForm ? "Cancel" : "Add Project"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="mb-8 rounded-xl border border-gray-800 bg-surface p-6 space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {FIELDS.map((field) => (
              <Field
                key={field.key}
                field={field}
                value={form[field.key]}
                error={errorFor(field.key)}
                onChange={(e) => setField(field.key, e.target.value)}
              />
            ))}
          </div>
          <button
            type="submit"
            disabled={saving || loading}
            className="rounded-lg bg-accent px-6 py-2 text-sm font-medium text-black transition-all hover:bg-accent-dim disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Loading…" : saving ? "Saving…" : editingId ? "Update Project" : "Add Project"}
          </button>
          {saveError && (
            <p role="alert" className="text-sm text-red-400">
              {saveError}
            </p>
          )}
        </form>
      )}

      {loading ? (
        <p role="status" className="text-sm text-gray-500">Loading projects…</p>
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
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold">{p.title}</h2>
                <p className="text-sm text-gray-400 truncate">{p.description}</p>
              </div>
              <div className="ml-4 flex gap-2">
                <button onClick={() => handleEdit(p)} disabled={saving} aria-label={`Edit ${p.title}`} className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"><FiEdit2 size={16} /></button>
                <button onClick={() => handleDelete(p.id)} disabled={saving} aria-label={`Delete ${p.title}`} className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-800 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"><FiTrash2 size={16} /></button>
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
    </>
  )
}

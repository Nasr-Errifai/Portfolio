import { useState, useEffect } from "react"
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi"
import { supabase } from "../../supabase"
import { run } from "../../lib/query"
import { checkFields, focusField } from "../../lib/validate"

const emptyForm = { name: "", category: "" }

const FIELDS = [
  { key: "name", label: "Skill name", required: true, placeholder: "React…" },
  { key: "category", label: "Category", required: true, placeholder: "Frameworks…" },
]

export default function SkillsManager() {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [saveError, setSaveError] = useState("")
  const [fieldError, setFieldError] = useState(null)
  const [saving, setSaving] = useState(false)
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

  // Focus waits for the commit, so aria-describedby is already on the input
  // when the screen reader announces it.
  useEffect(() => {
    if (fieldError) focusField(`skill-${fieldError.key}`)
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
    setFieldError(null)

    // name and category are the only columns this form owns, so nothing
    // else can ride along into the write.
    const data = {
      name: form.name.trim(),
      category: form.category.trim(),
    }

    setSaving(true)
    const res = editingId
      ? await run("skills.update", () =>
          supabase.from("skills").update(data).eq("id", editingId)
        )
      : await run("skills.insert", () => supabase.from("skills").insert([data]))
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

  const handleEdit = (s) => {
    if (saving) return
    setForm({ name: s.name || "", category: s.category || "" })
    setEditingId(s.id)
    setSaveError("")
    setFieldError(null)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (saving) return
    if (!confirm("Delete this skill?")) return
    setSaveError("")
    // saving also covers the delete, so the buttons and the form cannot
    // start a second write while this one is in flight.
    setSaving(true)
    const res = await run("skills.delete", () =>
      supabase.from("skills").delete().eq("id", id)
    )
    setSaving(false)
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
    <>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Skills</h1>
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
          <FiPlus /> {showForm ? "Cancel" : "Add Skill"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} noValidate className="mb-8 rounded-xl border border-gray-800 bg-surface p-6 space-y-4">
          {FIELDS.map(({ key, label, placeholder, required }) => {
            const error = fieldError?.key === key ? fieldError.message : ""
            const errorId = `skill-${key}-error`
            return (
              <div key={key}>
                <label htmlFor={`skill-${key}`} className="mb-2 block text-sm text-gray-400">{label}</label>
                <input
                  id={`skill-${key}`}
                  name={key}
                  autoComplete="off"
                  required={required}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? errorId : undefined}
                  className="w-full rounded-lg border border-gray-700 bg-bg px-4 py-2 text-sm focus:border-accent focus:outline-none"
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={(e) => {
                    setForm((prev) => ({ ...prev, [key]: e.target.value }))
                    setSaveError("")
                    setFieldError(null)
                  }}
                />
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
            disabled={saving || loading}
            className="rounded-lg bg-accent px-6 py-2 text-sm font-medium text-black transition-all hover:bg-accent-dim disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Loading…" : saving ? "Saving…" : editingId ? "Update Skill" : "Add Skill"}
          </button>
          {saveError && (
            <p role="alert" className="text-sm text-red-400">
              {saveError}
            </p>
          )}
        </form>
      )}

      {loading ? (
        <p role="status" className="text-sm text-gray-500">Loading skills…</p>
      ) : loadError ? (
        <p role="alert" className="text-sm text-red-400">
          {loadError}
        </p>
      ) : Object.keys(grouped).length === 0 ? (
        <p className="text-gray-500 italic">No skills yet.</p>
      ) : (
        Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="mb-6">
            <h2 className="mb-3 font-mono text-sm text-accent">{category}</h2>
            <div className="space-y-2">
              {items.map((s) => (
                <div key={s.id} className="flex items-center justify-between rounded-lg border border-gray-800 bg-surface p-3">
                  <span className="text-sm">{s.name}</span>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(s)} disabled={saving} aria-label={`Edit ${s.name}`} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-800 hover:text-accent disabled:cursor-not-allowed disabled:opacity-40"><FiEdit2 size={14} /></button>
                    <button onClick={() => handleDelete(s.id)} disabled={saving} aria-label={`Delete ${s.name}`} className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-800 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"><FiTrash2 size={14} /></button>
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
    </>
  )
}

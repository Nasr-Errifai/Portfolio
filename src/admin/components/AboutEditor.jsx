import { useState, useEffect } from "react"
import { supabase } from "../../supabase"
import { run } from "../../lib/query"
import Sidebar from "./Sidebar"

export default function AboutEditor() {
  const [bio, setBio] = useState("")
  const [photoUrl, setPhotoUrl] = useState("")
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [saveError, setSaveError] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let active = true
    run("content.select (about editor)", () =>
      supabase.from("content").select("bio, photo_url").single()
    ).then((res) => {
      if (!active) return
      if (res.ok) {
        setBio(res.data?.bio || "")
        setPhotoUrl(res.data?.photo_url || "")
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

  const handleSave = async (e) => {
    e.preventDefault()
    setSaveError("")
    setSaved(false)
    setSaving(true)

    // content holds exactly one row (sql/02_content_single_row.sql), so a
    // single upsert is enough. The other columns keep their values, because
    // merge-duplicates only writes the fields sent here.
    const res = await run("content.upsert (about)", () =>
      supabase
        .from("content")
        .upsert({ id: 1, bio, photo_url: photoUrl }, { onConflict: "id" })
    )

    setSaving(false)

    // Nothing is cleared on failure, so the typed bio is never lost.
    if (!res.ok) {
      setSaveError(res.error)
      return
    }

    setSaved(true)
  }

  // Saving while the load is still running would send empty values over the
  // real bio, so the button stays disabled until the data arrived.
  const disabled = loading || saving || loadError !== ""

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="mb-8 text-2xl font-bold">About Section</h1>

        {loadError && (
          <p role="alert" className="mb-6 text-sm text-red-400">
            {loadError}
          </p>
        )}

        <form onSubmit={handleSave} className="max-w-2xl space-y-6">
          <div>
            <label className="mb-2 block text-sm text-gray-400" htmlFor="about-bio">Bio</label>
            <textarea
              id="about-bio"
              className="w-full rounded-lg border border-gray-700 bg-bg px-4 py-3 text-sm focus:border-accent focus:outline-none"
              rows={8}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write your bio here."
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-gray-400" htmlFor="about-photo">Photo URL</label>
            <input
              id="about-photo"
              className="w-full rounded-lg border border-gray-700 bg-bg px-4 py-2 text-sm focus:border-accent focus:outline-none"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://example.com/photo.jpg"
            />
            {photoUrl && (
              <img src={photoUrl} alt="Preview" className="mt-3 h-32 w-32 rounded-xl border border-gray-800 object-cover" />
            )}
          </div>
          <button
            type="submit"
            disabled={disabled}
            className="rounded-lg bg-accent px-6 py-2 text-sm font-medium text-black transition-all hover:bg-accent-dim disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
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

import { useState, useEffect } from "react"
import { supabase } from "../supabase"
import Sidebar from "./Sidebar"

export default function AboutEditor() {
  const [bio, setBio] = useState("")
  const [photoUrl, setPhotoUrl] = useState("")
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.from("content").select("*").single().then(({ data }) => {
      if (data) {
        setBio(data.bio || "")
        setPhotoUrl(data.photo_url || "")
      }
    })
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    const { data: existing } = await supabase.from("content").select("id").single()
    if (existing) {
      await supabase.from("content").update({ bio, photo_url: photoUrl }).eq("id", existing.id)
    } else {
      await supabase.from("content").insert([{ bio, photo_url: photoUrl }])
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="mb-8 text-2xl font-bold">About Section</h1>
        <form onSubmit={handleSave} className="max-w-2xl space-y-6">
          <div>
            <label className="mb-2 block text-sm text-gray-400">Bio</label>
            <textarea className="w-full rounded-lg border border-gray-700 bg-bg px-4 py-3 text-sm focus:border-accent focus:outline-none" rows={8} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Write your bio here." />
          </div>
          <div>
            <label className="mb-2 block text-sm text-gray-400">Photo URL</label>
            <input className="w-full rounded-lg border border-gray-700 bg-bg px-4 py-2 text-sm focus:border-accent focus:outline-none" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://example.com/photo.jpg" />
            {photoUrl && <img src={photoUrl} alt="Preview" className="mt-3 h-32 w-32 rounded-xl border border-gray-800 object-cover" />}
          </div>
          <button type="submit" className="rounded-lg bg-accent px-6 py-2 text-sm font-medium text-black transition-all hover:bg-accent-dim">Save Changes</button>
          {saved && <span className="ml-4 text-sm text-green-400">Saved!</span>}
        </form>
      </main>
    </div>
  )
}

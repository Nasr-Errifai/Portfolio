import { useState, useEffect } from "react"
import { FiFolder, FiCode, FiUser, FiMail } from "react-icons/fi"
import { supabase } from "../../supabase"
import { run } from "../../lib/query"

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let active = true
    // Both counts are independent, so they are asked in parallel.
    Promise.all([
      run("projects.count", () =>
        supabase.from("projects").select("*", { count: "exact", head: true })
      ),
      run("skills.count", () =>
        supabase.from("skills").select("*", { count: "exact", head: true })
      ),
    ]).then(([projects, skills]) => {
      if (!active) return
      const failed = []
      if (!projects.ok) failed.push(`projects: ${projects.error}`)
      if (!skills.ok) failed.push(`skills: ${skills.error}`)
      setStats({
        projects: projects.ok ? (projects.count ?? 0) : "—",
        skills: skills.ok ? (skills.count ?? 0) : "—",
      })
      setError(failed.join(" · "))
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [])

  const cards = [
    { icon: FiFolder, label: "Projects", count: stats?.projects, color: "text-blue-400" },
    { icon: FiCode, label: "Skills", count: stats?.skills, color: "text-green-400" },
    { icon: FiUser, label: "About", count: "Edit", color: "text-violet-400" },
    { icon: FiMail, label: "Contact", count: "Edit", color: "text-amber-400" },
  ]

  return (
    <>
      <h1 className="mb-8 text-2xl font-bold">Dashboard</h1>

      {error && (
        <p role="alert" className="mb-6 text-sm text-red-400">
          {error}
        </p>
      )}

      {loading ? (
        <p role="status" className="text-sm text-gray-500">Loading counts…</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ icon: Icon, label, count, color }) => (
            <div key={label} className="rounded-xl border border-gray-800 bg-surface p-6">
              <div className="mb-3 flex items-center gap-3">
                <Icon className={color} size={24} aria-hidden="true" />
                <span className="text-sm text-gray-400">{label}</span>
              </div>
              <p className="text-3xl font-bold">{count}</p>
            </div>
          ))}
        </div>
      )}

      <p className="mt-12 text-sm text-gray-500">
        Use the sidebar to manage your portfolio content.
      </p>
    </>
  )
}

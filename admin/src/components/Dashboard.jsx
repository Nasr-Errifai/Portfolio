import { useState, useEffect } from "react"
import { supabase } from "../supabase"
import Sidebar from "./Sidebar"
import { FiFolder, FiCode, FiUser, FiMail } from "react-icons/fi"

export default function Dashboard() {
  const [stats, setStats] = useState({ projects: 0, skills: 0 })

  useEffect(() => {
    Promise.all([
      supabase.from("projects").select("*", { count: "exact", head: true }),
      supabase.from("skills").select("*", { count: "exact", head: true }),
    ]).then(([{ count: pc }, { count: sc }]) => setStats({ projects: pc || 0, skills: sc || 0 }))
  }, [])

  const cards = [
    { icon: FiFolder, label: "Projects", count: stats.projects, color: "text-blue-400" },
    { icon: FiCode, label: "Skills", count: stats.skills, color: "text-green-400" },
    { icon: FiUser, label: "About", count: "Edit", color: "text-violet-400" },
    { icon: FiMail, label: "Contact", count: "Edit", color: "text-amber-400" },
  ]

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="mb-8 text-2xl font-bold">Dashboard</h1>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map(({ icon: Icon, label, count, color }) => (
            <div key={label} className="rounded-xl border border-gray-800 bg-surface p-6">
              <div className="mb-3 flex items-center gap-3">
                <Icon className={color} size={24} />
                <span className="text-sm text-gray-400">{label}</span>
              </div>
              <p className="text-3xl font-bold">{count}</p>
            </div>
          ))}
        </div>
        <p className="mt-12 text-sm text-gray-500">Use the sidebar to manage your portfolio content.</p>
      </main>
    </div>
  )
}

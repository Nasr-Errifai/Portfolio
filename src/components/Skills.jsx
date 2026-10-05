import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { supabase } from "../supabase"
import { run } from "../lib/query"

export default function Skills({ onError }) {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true
    run("skills.select (public)", () =>
      supabase.from("skills").select("*").order("category")
    ).then((res) => {
      if (!active) return
      if (res.ok) setSkills(res.data || [])
      else {
        setFailed(true)
        onError?.()
      }
      setLoading(false)
    })
    return () => {
      active = false
    }
  }, [onError])

  if (loading || failed || skills.length === 0) return null

  const grouped = skills.reduce((acc, skill) => {
    const cat = skill.category || "Other"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(skill.name)
    return acc
  }, {})

  if (Object.keys(grouped).length === 0) return null

  return (
    <section id="skills" className="px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: "-100px" }}
        className="mx-auto max-w-4xl"
      >
        <h2 className="mb-2 font-mono text-sm text-accent">/skills</h2>
        <h3 className="mb-12 text-3xl font-bold">Tools & Technologies</h3>

        <div className="grid gap-8 sm:grid-cols-3">
          {Object.entries(grouped).map(([category, items]) => (
            <div
              key={category}
              className="rounded-xl border border-gray-800 bg-surface p-6"
            >
              <h4 className="mb-4 font-mono text-sm text-accent">
                {category}
              </h4>
              <div className="flex flex-wrap gap-3">
                {items.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-md bg-bg px-3 py-1.5 text-sm text-gray-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

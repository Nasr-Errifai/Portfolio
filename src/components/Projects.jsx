import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FiExternalLink, FiGithub } from "react-icons/fi"
import { supabase } from "../supabase"
import { run } from "../lib/query"

export default function Projects({ onError }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true
    run("projects.select (public)", () =>
      supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false })
    ).then((res) => {
      if (!active) return
      if (res.ok) setProjects(res.data || [])
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

  if (loading || failed || projects.length === 0) return null

  return (
    <section id="projects" className="px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: "-100px" }}
        className="mx-auto max-w-5xl"
      >
        <h2 className="mb-2 font-mono text-sm text-accent">/projects</h2>
        <h3 className="mb-12 text-3xl font-bold">Things I've Built</h3>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="group rounded-xl border border-gray-800 bg-surface p-6 transition-all duration-300 hover:border-accent/40 hover:shadow-[0_0_30px_var(--color-accent)]"
            >
              {project.image ? (
                <div className="mb-4 overflow-hidden rounded-lg">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="h-40 w-full object-cover"
                  />
                </div>
              ) : (
                <div className="mb-4 flex h-40 items-center justify-center rounded-lg bg-bg">
                  <span className="text-3xl font-bold text-accent/30">
                    {project.title
                      .split(" ")
                      .map((w) => w[0])
                      .join("")}
                  </span>
                </div>
              )}
              <h4 className="mb-2 text-lg font-semibold">{project.title}</h4>
              <p className="mb-4 text-sm leading-relaxed text-gray-400">
                {project.description}
              </p>
              {project.tech?.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-accent/10 px-3 py-1 font-mono text-xs text-accent"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex gap-4">
                {project.live_url && (
                  <a
                    href={project.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-accent"
                  >
                    <FiExternalLink /> Live Demo
                  </a>
                )}
                {project.repo_url && (
                  <a
                    href={project.repo_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-accent"
                  >
                    <FiGithub /> Source
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

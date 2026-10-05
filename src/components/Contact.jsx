import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FiMail, FiGithub, FiLinkedin, FiDownload } from "react-icons/fi"
import { supabase } from "../supabase"
import { run } from "../lib/query"

export default function Contact({ onError }) {
  const [content, setContent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true
    run("content.select (contact)", () =>
      supabase.from("content").select("*").single()
    ).then((res) => {
      if (!active) return
      if (res.ok) setContent(res.data)
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

  if (loading || failed || !content) return null

  const { email, github, linkedin, resume_url, message } = content

  const links = [
    email && { icon: FiMail, label: email, href: `mailto:${email}` },
    github && { icon: FiGithub, label: "GitHub", href: github },
    linkedin && { icon: FiLinkedin, label: "LinkedIn", href: linkedin },
  ].filter(Boolean)

  if (links.length === 0 && !resume_url) return null

  return (
    <section id="contact" className="px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: "-100px" }}
        className="mx-auto max-w-lg text-center"
      >
        <h2 className="mb-2 font-mono text-sm text-accent">/contact</h2>
        <h3 className="mb-4 text-3xl font-bold">Get In Touch</h3>
        {message && (
          <p className="mb-10 text-gray-400 leading-relaxed">{message}</p>
        )}
        <div className="flex flex-col items-center gap-6">
          {links.map(({ icon: Icon, label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-gray-400 transition-colors hover:text-accent"
            >
              <Icon size={20} /> <span>{label}</span>
            </a>
          ))}
          {resume_url && (
            <a
              href={resume_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center gap-2 rounded-lg border border-gray-600 px-6 py-3 text-sm font-medium text-gray-300 transition-all hover:border-accent hover:text-accent"
            >
              <FiDownload /> Download Resume
            </a>
          )}
        </div>
      </motion.div>
    </section>
  )
}

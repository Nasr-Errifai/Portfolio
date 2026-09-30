import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { supabase } from "../supabase"

export default function About() {
  const [data, setData] = useState(null)

  useEffect(() => {
    supabase.from("content").select("*").single().then(({ data }) => setData(data))
  }, [])

  const bio = data?.bio
  const photo = data?.photo_url

  return (
    <section id="about" className="px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: "-100px" }}
        className="mx-auto flex max-w-4xl flex-col items-center gap-12 md:flex-row"
      >
        <div className="flex-1">
          <h2 className="mb-2 font-mono text-sm text-accent">/about</h2>
          <h3 className="mb-6 text-3xl font-bold">About Me</h3>
          {bio ? (
            <div className="space-y-4 text-gray-400 leading-relaxed">
              {bio.split("\n").map((p, i) => <p key={i}>{p}</p>)}
            </div>
          ) : (
            <p className="text-gray-500 italic">Add your bio from the admin dashboard.</p>
          )}
        </div>

        <div className="flex-shrink-0">
          {photo ? (
            <img src={photo} alt="Nasr Errifai" className="h-64 w-64 rounded-2xl border border-gray-800 object-cover" />
          ) : (
            <div className="flex h-64 w-64 items-center justify-center rounded-2xl border border-gray-800 bg-surface">
              <span className="text-5xl font-bold text-accent/40">NE</span>
            </div>
          )}
        </div>
      </motion.div>
    </section>
  )
}

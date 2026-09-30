import { useState, useEffect } from "react"
import { motion } from "framer-motion"

const terminalLines = [
  { text: "$ whoami", delay: 500 },
  { text: "4th Year Engineering Student, EMSI", delay: 1800 },
  { text: "El Jadida, Morocco", delay: 3000 },
]

export default function Hero() {
  const [visibleLines, setVisibleLines] = useState(0)

  useEffect(() => {
    const timers = terminalLines.map(
      (line, i) => setTimeout(() => setVisibleLines((v) => Math.max(v, i + 1)), line.delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <section
      id="hero"
      className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-20"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-4 font-mono text-sm text-accent"
        >
          Software Engineering Student — EMSI
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
        >
          Hi, I'm{" "}
          <span className="text-accent">Nasr Errifai</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 max-w-lg text-base text-gray-400 sm:text-lg"
        >
          4th-year engineering student at EMSI, building clean, reliable web
          applications while learning the craft.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-12 flex gap-4"
        >
          <a href="#projects" className="rounded-lg bg-accent px-6 py-3 text-sm font-medium text-black transition-all hover:bg-accent-dim hover:shadow-[0_0_24px_var(--color-accent)]">
            View My Work
          </a>
          <a href="#contact" className="rounded-lg border border-gray-600 px-6 py-3 text-sm font-medium text-gray-300 transition-all hover:border-accent hover:text-accent">
            Get In Touch
          </a>
        </motion.div>

        <div className="w-full max-w-sm rounded-lg border border-gray-800 bg-surface/50 p-4 font-mono text-sm">
          {terminalLines.slice(0, visibleLines).map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className={i === 0 ? "text-accent" : "text-gray-300"}
            >
              {line.text}
            </motion.p>
          ))}
          {visibleLines < terminalLines.length && (
            <span className="inline-block h-4 w-2 animate-pulse bg-accent" />
          )}
        </div>
      </div>
    </section>
  )
}

import { useCallback, useState } from "react"
import Navbar from "../components/Navbar"
import Hero from "../components/Hero"
import About from "../components/About"
import Projects from "../components/Projects"
import Skills from "../components/Skills"
import Contact from "../components/Contact"
import Footer from "../components/Footer"
import { PUBLIC_ERROR_MESSAGE } from "../lib/query"

export default function Home() {
  const [loadFailed, setLoadFailed] = useState(false)
  const handleError = useCallback(() => setLoadFailed(true), [])

  return (
    <>
      <div className="grain-overlay" />
      <Navbar />
      <main>
        <Hero />
        {loadFailed && (
          <p
            role="alert"
            className="mx-auto max-w-5xl px-6 py-16 text-center text-sm text-gray-400"
          >
            {PUBLIC_ERROR_MESSAGE}
          </p>
        )}
        <About onError={handleError} />
        <Projects onError={handleError} />
        <Skills onError={handleError} />
        <Contact onError={handleError} />
      </main>
      <Footer />
    </>
  )
}

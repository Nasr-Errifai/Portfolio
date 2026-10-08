import Navbar from "../components/Navbar"
import Hero from "../components/Hero"
import About from "../components/About"
import Projects from "../components/Projects"
import Skills from "../components/Skills"
import Contact from "../components/Contact"
import Footer from "../components/Footer"
import usePortfolioData, { getVisibleSections } from "../data/usePortfolioData"
import { PUBLIC_ERROR_MESSAGE } from "../lib/query"

export default function Home() {
  const { loading, failed, content, projects, skills } = usePortfolioData()
  const sections = getVisibleSections({ loading, content, projects, skills })

  return (
    <>
      <div className="grain-overlay" />
      <Navbar sections={sections} />
      <main>
        <Hero />
        {failed && (
          <p
            role="alert"
            className="mx-auto max-w-5xl px-6 py-16 text-center text-sm text-gray-400"
          >
            {PUBLIC_ERROR_MESSAGE}
          </p>
        )}
        <About content={content} />
        <Projects projects={projects} />
        <Skills skills={skills} />
        <Contact content={content} />
      </main>
      <Footer />
    </>
  )
}

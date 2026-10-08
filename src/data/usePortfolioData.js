import { useEffect, useState } from "react"
import { supabase } from "../supabase"
import { run } from "../lib/query"

const initial = {
  loading: true,
  failed: false,
  content: null,
  projects: [],
  skills: [],
}

// One load for the whole public page. Three reads in parallel, where the
// page used to make four (content was fetched by About and by Contact).
export default function usePortfolioData() {
  const [state, setState] = useState(initial)

  useEffect(() => {
    let active = true

    Promise.all([
      run("content.select (public)", () =>
        supabase.from("content").select("*").single()
      ),
      run("projects.select (public)", () =>
        supabase
          .from("projects")
          .select("*")
          .order("created_at", { ascending: false })
      ),
      run("skills.select (public)", () =>
        supabase.from("skills").select("*").order("category")
      ),
    ]).then(([content, projects, skills]) => {
      if (!active) return
      setState({
        loading: false,
        // A failed read only hides its own section, the rest still shows.
        failed: !content.ok || !projects.ok || !skills.ok,
        content: content.ok ? content.data : null,
        projects: projects.ok ? projects.data || [] : [],
        skills: skills.ok ? skills.data || [] : [],
      })
    }).catch(() => {
      // run() does not reject today, but if a read ever throws the page
      // must not stay stuck on "loading" with no message.
      if (!active) return
      setState({ ...initial, loading: false, failed: true })
    })

    return () => {
      active = false
    }
  }, [])

  return state
}

export function hasBio(content) {
  return Boolean(content && (content.bio || content.photo_url))
}

export function hasContact(content) {
  if (!content) return false
  return Boolean(
    content.email || content.github || content.linkedin || content.resume_url
  )
}

// The sections the page will really render, so the navbar never links to a
// section that is not there. Before the data arrives only the hero is known.
export function getVisibleSections({ loading, content, projects, skills }) {
  if (loading) return ["hero"]
  return [
    "hero",
    hasBio(content) && "about",
    projects.length > 0 && "projects",
    skills.length > 0 && "skills",
    hasContact(content) && "contact",
  ].filter(Boolean)
}

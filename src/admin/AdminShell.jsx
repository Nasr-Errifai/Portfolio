import { Outlet } from "react-router-dom"
import Sidebar from "./components/Sidebar"

// One frame for the whole admin: the sidebar never remounts while you move
// between pages, and each page only renders its own content.
export default function AdminShell() {
  return (
    <div className="flex min-h-screen">
      <a
        href="#admin-main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:text-black"
      >
        Skip to content
      </a>
      <Sidebar />
      <main id="admin-main" tabIndex={-1} className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}

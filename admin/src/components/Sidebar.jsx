import { NavLink } from "react-router-dom"
import { supabase } from "../supabase"
import { FiGrid, FiFolder, FiCode, FiUser, FiMail, FiLogOut } from "react-icons/fi"

const links = [
  { to: "/dashboard", icon: FiGrid, label: "Overview" },
  { to: "/dashboard/projects", icon: FiFolder, label: "Projects" },
  { to: "/dashboard/skills", icon: FiCode, label: "Skills" },
  { to: "/dashboard/about", icon: FiUser, label: "About" },
  { to: "/dashboard/contact", icon: FiMail, label: "Contact" },
]

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-56 flex-col border-r border-gray-800 bg-surface">
      <div className="flex items-center gap-2 border-b border-gray-800 px-5 py-4">
        <span className="font-mono text-lg text-accent">&lt;NE /&gt;</span>
        <span className="text-xs text-gray-500">admin</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/dashboard"}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive ? "bg-accent/10 text-accent" : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            <Icon size={16} /> {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-gray-800 p-3">
        <button
          onClick={() => supabase.auth.signOut()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
        >
          <FiLogOut size={16} /> Sign Out
        </button>
      </div>
    </aside>
  )
}

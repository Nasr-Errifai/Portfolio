import { createContext, useContext } from "react"

// The whole admin asks this one place who is signed in, so the session and
// the is_admin() check happen once instead of on every page change.
export const AuthContext = createContext(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used inside an AuthProvider")
  return context
}

// Shared checks for the admin forms. Every optional field may stay empty,
// but a filled one has to look right — an empty check has no character.

export function isHttpUrl(value) {
  if (!value) return true
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

export function isEmail(value) {
  if (!value) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

// Returns { key, message } for the first broken rule, or null when the form
// is safe to send. The key lets the caller point the message at its input and
// move focus there.
export function checkFields(rules, form) {
  for (const rule of rules) {
    const value = String(form[rule.key] ?? "").trim()
    if (!value) {
      if (rule.required) return { key: rule.key, message: `${rule.label} is required.` }
      continue
    }
    if (rule.type === "url" && !isHttpUrl(value)) {
      return { key: rule.key, message: `${rule.label} must start with http:// or https://.` }
    }
    if (rule.type === "email" && !isEmail(value)) {
      return { key: rule.key, message: `${rule.label} must be a valid address, like name@example.com.` }
    }
  }
  return null
}

// Moves the keyboard to the input that needs fixing.
export function focusField(id) {
  document.getElementById(id)?.focus()
}

// One helper for every Supabase call, so checking `error` is always the
// same pattern: wrap the call in run("<table>.<action>", () => ...),
// then branch on res.ok. Nothing else in the app touches `.error` directly.

export const PUBLIC_ERROR_MESSAGE =
  "Some content couldn't be loaded. Please refresh the page."

export async function run(context, fn) {
  let result
  try {
    result = await fn()
  } catch (err) {
    console.error(`[supabase] ${context}:`, err)
    return { ok: false, data: null, error: err?.message || "Unexpected error" }
  }

  if (!result || typeof result !== "object") {
    console.error(`[supabase] ${context}: no response`)
    return { ok: false, data: null, error: "No response from the server" }
  }

  const { data, error, count } = result

  if (error) {
    console.error(`[supabase] ${context}:`, error.message || error)
    return { ok: false, data: null, error: error.message || "Unexpected error" }
  }

  return { ok: true, data, count }
}

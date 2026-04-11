import { setupServer } from 'msw/node'

// MSW node server — request handlers are registered per-test via
// `server.use(...)` so each test file keeps full control of the fixtures.
// The shared base URL matches VITE_SUPABASE_URL in .env.
export const SUPABASE_URL = 'https://placeholder.supabase.co'
export const SUPABASE_REST = `${SUPABASE_URL}/rest/v1`

export const server = setupServer()

import { createClient } from '@supabase/supabase-js'

// NOTE: The canonical `Database` type is generated into `src/types/supabase.ts`.
// At the time of writing, the remote Supabase project does not yet have any
// tables in its `public` schema (migrations not applied), so the generated
// Database.Tables is structurally empty. Passing it as a generic here would
// make every `.from('<name>')` call a type error. Until `npx supabase db push`
// is run against the remote project and the types are regenerated, we rely on
// the default permissive generic from createClient. Swap the import to
// `createClient<Database>` once the generated file exposes real tables.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables. ' +
    'Copy .env.example to .env and fill in your Supabase credentials.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

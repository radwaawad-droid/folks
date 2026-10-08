// Admin (service-role) client — SERVER ONLY. Never import this into a client component.
// It bypasses Row Level Security, so we use it only inside API routes to read a
// recipient's private notify_email when sending notifications.
import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

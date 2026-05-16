import { createAdminClient } from '@/lib/supabase/admin'

export async function logActivity(userId: string, action: string, details?: string): Promise<void> {
  try {
    const admin = createAdminClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (admin as any).from('activity_log').insert({
      user_id: userId,
      action,
      ...(details ? { details } : {}),
    })
  } catch {
    // Never throw — a logging failure must never break the calling action
  }
}

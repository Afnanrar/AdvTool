// @deno-types="https://esm.sh/@supabase/functions-js/src/edge-functions.d.ts"
import { supabaseAdmin } from './supabaseAdmin.ts'
import { User } from 'https://esm.sh/@supabase/supabase-js@2'

/**
 * Retrieves the authenticated user object from the request's Authorization header.
 * Throws an error if the user is not authenticated.
 * @param req The incoming request object.
 * @returns The authenticated Supabase user object.
 */
export async function getUser(req: Request): Promise<User> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    throw new Error('Missing Authorization header')
  }

  const jwt = authHeader.replace('Bearer ', '')
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(jwt)

  if (error) {
    throw new Error(`Authentication error: ${error.message}`)
  }
  if (!user) {
    throw new Error('User not found for the provided token')
  }

  return user
}

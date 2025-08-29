// @deno-types="https://esm.sh/@supabase/functions-js/src/edge-functions.d.ts"
// supabase/functions/_shared/supabaseAdmin.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Fix: Add a type declaration for the Deno global object to allow TypeScript to compile in non-Deno environments where this code is linted.
declare const Deno: any;

// Create a Supabase client with the service role key
export const supabaseAdmin = createClient(
  // Supabase API URL - env var is automatically set by Supabase
  Deno.env.get('SUPABASE_URL') ?? '',
  // Supabase Service Role KEY - Make sure to set this in your project secrets
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

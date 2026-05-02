/// <reference lib="deno.ns" />
// supabase/functions/admin-update-user/index.ts
// Edge Function: Admin updates a user's profile AND auth credentials
// Runs server-side with service_role key — bypasses all RLS.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Verify caller is admin
    const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user: caller }, error: callerError } = await callerClient.auth.getUser()
    if (callerError || !caller) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Use service_role to check admin status (bypasses RLS)
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    })
    const { data: callerProfile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('id', caller.id)
      .single()

    const role = callerProfile?.role || caller.app_metadata?.role || caller.user_metadata?.role
    console.log(`Caller ${caller.id} has role: ${role}`)

    if (role !== 'admin' && role !== 'superadmin') {
      return new Response(JSON.stringify({ error: 'Forbidden: administrative role required', callerRole: role }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Parse request - handle both 'email' and 'newEmail' naming
    const body = await req.json()
    const { userId, profile } = body
    const email = body.email || body.newEmail
    const password = body.password || body.newPassword

    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId is required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`Admin ${caller.id} is updating user ${userId}`)
    
    // 0. PRE-CHECK: Does this user even exist in Auth?
    const { data: { user: existingAuthUser }, error: findError } = await adminClient.auth.admin.getUserById(userId)
    if (findError || !existingAuthUser) {
      console.error(`User ${userId} not found in Auth table!`)
      return new Response(JSON.stringify({ 
        error: `User not found in Auth table. They might only exist in the Profiles table.`,
        userId 
      }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    console.log(`Found Auth User: ${existingAuthUser.email} (ID: ${existingAuthUser.id})`)

    const results: string[] = []

    // 1. Update auth credentials FIRST
    const authUpdates: Record<string, any> = {}
    if (email) authUpdates.email = email
    if (password) authUpdates.password = password

    if (Object.keys(authUpdates).length > 0) {
      console.log(`Attempting Auth update...`, authUpdates)
      
      const { data: authData, error: authError } = await adminClient.auth.admin.updateUserById(userId, {
        ...authUpdates,
        email_confirm: true,
        confirm: true,
        new_email_confirm: true
      })
      
      if (authError) {
        console.error('Auth update CRITICAL error:', authError)
        return new Response(JSON.stringify({ 
          error: `Auth update failed: ${authError.message}`,
          fullError: authError
        }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // NUCLEAR OPTION: If email was provided, force it via the SQL function we just created
      if (email) {
        console.log(`Firing Nuclear Option for ${userId} -> ${email}`)
        const { error: rpcError } = await adminClient.rpc('force_update_user_email', {
          target_user_id: userId,
          new_email: email
        })
        
        if (rpcError) {
          console.error('Nuclear Option failed:', rpcError)
          // Don't fail the whole request, but log it
          results.push(`force sync warning: ${rpcError.message}`)
        } else {
          results.push(`auth forced via SQL`)
        }
      }

      // FINAL VERIFICATION
      const { data: { user: verifiedUser } } = await adminClient.auth.admin.getUserById(userId)
      results.push(`confirmed (Current Auth Email: ${verifiedUser?.email})`)
    }

    // 2. Update profile fields
    if (profile && Object.keys(profile).length > 0) {
      console.log(`Attempting Profile update...`, profile)
      const { error: profileError } = await adminClient
        .from('profiles')
        .update(profile)
        .eq('id', userId)
      
      if (profileError) {
        console.error('Profile update error:', profileError)
        results.push(`profile update failed: ${profileError.message}`)
      } else {
        results.push('profile fields updated')
      }
    }

    return new Response(JSON.stringify({ 
      message: results.join('; '), 
      success: !results.some(r => r.includes('failed')),
      results
    }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Global Function Error:', err)
    return new Response(JSON.stringify({ 
      error: (err as Error).message, 
      stack: (err as Error).stack 
    }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

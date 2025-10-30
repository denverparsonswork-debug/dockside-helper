import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Verify2FACodeRequest {
  email: string;
  code: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, code }: Verify2FACodeRequest = await req.json();

    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: "Email and code are required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client with service role
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Rate limiting: Check attempts in last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: recentAttempts, error: attemptsError } = await supabase
      .from("failed_login_attempts")
      .select("id")
      .eq("identifier", email)
      .gte("attempt_time", fiveMinutesAgo);

    if (attemptsError) {
      console.error("Error checking rate limit:", attemptsError.message);
    }

    if (recentAttempts && recentAttempts.length >= 10) {
      return new Response(
        JSON.stringify({ error: "Too many verification attempts. Please request a new code." }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get user by email
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error("Error fetching users:", userError.message);
      return new Response(
        JSON.stringify({ error: "Verification failed" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const user = users.find(u => u.email === email);
    
    if (!user) {
      // Track failed attempt
      await supabase.from("failed_login_attempts").insert({
        identifier: email,
        attempt_time: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({ error: "Invalid verification code" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get the most recent unused code for this user
    const { data: codes, error: codeError } = await supabase
      .from("two_factor_codes")
      .select("*")
      .eq("user_id", user.id)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (codeError || !codes || codes.length === 0) {
      // Track failed attempt
      await supabase.from("failed_login_attempts").insert({
        identifier: email,
        attempt_time: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({ error: "Invalid or expired verification code" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const storedCode = codes[0];

    // Verify code matches
    if (storedCode.code !== code) {
      // Track failed attempt
      await supabase.from("failed_login_attempts").insert({
        identifier: email,
        attempt_time: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({ error: "Invalid verification code" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Mark code as used
    await supabase
      .from("two_factor_codes")
      .update({ used: true })
      .eq("id", storedCode.id);

    // Clean up old codes
    await supabase.rpc("cleanup_expired_2fa_codes");
    await supabase.rpc("cleanup_old_failed_attempts");

    console.log("2FA verification successful");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Verification successful",
        userId: user.id 
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in verify-2fa-code function:", error.message);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

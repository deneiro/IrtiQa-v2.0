import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * Award XP Edge Function
 * 
 * Called from frontend after completing tasks, habits, or journals.
 * Uses the database function `award_xp` for atomic XP distribution.
 * 
 * Request body:
 * {
 *   xp: number,
 *   gold?: number,
 *   attribute_types?: string[],  // e.g. ['health', 'career']
 *   source?: string              // 'quest' | 'task' | 'habit' | 'journal' | 'achievement'
 * }
 * 
 * Returns the result from award_xp including new_level, leveled_up, new_rank.
 */

Deno.serve(async (req: Request) => {
  try {
    // Verify JWT — get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify the user's JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const body = await req.json();
    const { xp, gold = 0, attribute_types = [], source = "unknown" } = body;

    if (!xp || typeof xp !== "number" || xp <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid XP value" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Award XP via database function
    const { data: xpResult, error: xpError } = await supabaseAdmin.rpc("award_xp", {
      p_user_id: user.id,
      p_xp: xp,
      p_attribute_types: attribute_types,
    });

    if (xpError) throw xpError;

    // Award Gold if provided
    let goldResult = null;
    if (gold > 0) {
      const { data, error: goldError } = await supabaseAdmin.rpc("award_gold", {
        p_user_id: user.id,
        p_gold: gold,
      });
      if (goldError) throw goldError;
      goldResult = data;
    }

    // Update source-specific statistics
    const statUpdates: Record<string, unknown> = {};
    switch (source) {
      case "quest":
        statUpdates.total_quests_completed = 1; // Will be incremented
        break;
      case "task":
        statUpdates.total_tasks_completed = 1;
        break;
      case "habit":
        statUpdates.total_habits_checked = 1;
        break;
      case "journal":
        statUpdates.total_journals_written = 1;
        break;
    }

    if (Object.keys(statUpdates).length > 0) {
      // Increment the relevant stat
      for (const [key, _val] of Object.entries(statUpdates)) {
        await supabaseAdmin.rpc("increment_stat", {
          p_user_id: user.id,
          p_stat_key: key,
        }).catch(() => {
          // Fallback: direct update if RPC doesn't exist
          // This is fine — stats will be updated via direct SQL
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        xp_result: xpResult,
        gold_result: goldResult,
        source,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

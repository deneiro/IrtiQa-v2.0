import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * Achievement Check Edge Function
 * 
 * Called after stat updates to evaluate and unlock achievements.
 * Compares user_statistics against achievements catalog conditions.
 * 
 * Can be called:
 * - After any stat-changing action (task completion, habit check-in, etc.)
 * - As a periodic sweep
 * 
 * Request body (optional):
 * { scope?: string }  // If provided, only check achievements of this scope
 * 
 * Returns newly unlocked achievements.
 */

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: string;
  scope: string;
  condition_key: string;
  condition_value: number;
  xp_reward: number;
  gold_reward: number;
}

interface UserStats {
  [key: string]: number | string;
}

Deno.serve(async (req: Request) => {
  try {
    // Verify JWT
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

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse optional scope filter
    let scope: string | null = null;
    try {
      const body = await req.json();
      scope = body.scope || null;
    } catch {
      // No body — check all scopes
    }

    // Get user's current statistics
    const { data: stats, error: statsError } = await supabaseAdmin
      .from("user_statistics")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (statsError || !stats) {
      return new Response(
        JSON.stringify({ error: "User statistics not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get already unlocked achievement IDs
    const { data: unlocked, error: unlockedError } = await supabaseAdmin
      .from("user_achievements")
      .select("achievement_id")
      .eq("user_id", user.id);

    if (unlockedError) throw unlockedError;

    const unlockedIds = new Set((unlocked || []).map((u: { achievement_id: string }) => u.achievement_id));

    // Get all achievements (optionally filtered by scope)
    let query = supabaseAdmin.from("achievements").select("*");
    if (scope) {
      query = query.eq("scope", scope);
    }

    const { data: achievements, error: achievementsError } = await query;
    if (achievementsError) throw achievementsError;

    // Check each achievement condition
    const newlyUnlocked: Achievement[] = [];

    for (const achievement of (achievements || []) as Achievement[]) {
      // Skip already unlocked
      if (unlockedIds.has(achievement.id)) continue;

      // Check condition
      const statValue = (stats as UserStats)[achievement.condition_key];
      if (typeof statValue === "number" && statValue >= achievement.condition_value) {
        // Unlock the achievement!
        const { error: insertError } = await supabaseAdmin
          .from("user_achievements")
          .insert({
            user_id: user.id,
            achievement_id: achievement.id,
          });

        if (insertError) {
          // Skip if already exists (race condition safety)
          if (insertError.code === "23505") continue;
          throw insertError;
        }

        newlyUnlocked.push(achievement);

        // Award achievement XP and gold
        if (achievement.xp_reward > 0) {
          await supabaseAdmin.rpc("award_xp", {
            p_user_id: user.id,
            p_xp: achievement.xp_reward,
            p_attribute_types: [],
          });
        }

        if (achievement.gold_reward > 0) {
          await supabaseAdmin.rpc("award_gold", {
            p_user_id: user.id,
            p_gold: achievement.gold_reward,
          });
        }

        // Update achievement unlock count in statistics
        await supabaseAdmin
          .from("user_statistics")
          .update({
            total_achievements_unlocked: (stats as UserStats).total_achievements_unlocked as number + newlyUnlocked.length,
          })
          .eq("user_id", user.id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        newly_unlocked: newlyUnlocked,
        total_checked: (achievements || []).length,
        total_new: newlyUnlocked.length,
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

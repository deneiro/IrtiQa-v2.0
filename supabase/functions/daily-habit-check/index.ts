import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * Daily Habit Check — Cron Job Edge Function v1
 * 
 * Runs every hour. 
 * 1. For timezones at 00:xx local time -> Generate EMPTY logs for scheduled habits.
 * 2. For timezones at 23:xx local time -> Mark all remaining EMPTY logs as FAILED.
 */

Deno.serve(async (req: Request) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Get all unique timezones
    const { data: profiles, error: tzError } = await supabase
      .from("profiles")
      .select("timezone")
      .not("timezone", "is", null);

    if (tzError) throw tzError;

    const uniqueTzs = [...new Set((profiles || []).map((p: any) => p.timezone))];
    const now = new Date();
    
    const startOfDayTzs: string[] = [];
    const endOfDayTzs: string[] = [];

    for (const tz of uniqueTzs) {
      try {
        const localTime = new Date(now.toLocaleString("en-US", { timeZone: tz as string }));
        const hour = localTime.getHours();
        
        if (hour === 0) startOfDayTzs.push(tz as string);
        if (hour === 23) endOfDayTzs.push(tz as string);
      } catch { continue; }
    }

    let processedStart = 0;
    let processedEnd = 0;

    // --- PHASE A: START OF DAY (00:xx) ---
    // Generate EMPTY logs for today's scheduled habits
    if (startOfDayTzs.length > 0) {
      const { data: users } = await supabase.from("profiles").select("user_id, timezone").in("timezone", startOfDayTzs);
      const dayOfWeek = now.getDay(); // 0=Sun..6=Sat
      const todayStr = now.toISOString().split("T")[0];

      for (const user of users || []) {
        const { data: habits } = await supabase.from("habits").select("*").eq("user_id", user.user_id).eq("is_active", true);
        
        const logsToCreate = (habits || []).filter(h => {
          // Daily
          if (h.frequency === 'daily') return true;
          // Weekly
          if (h.frequency === 'weekly' && h.schedule_days?.includes(dayOfWeek)) return true;
          // Occasional
          if (h.frequency === 'occasional' && h.schedule_dates?.includes(todayStr)) return true;
          // Custom (Legacy)
          if (h.frequency === 'custom' && h.schedule_days?.includes(dayOfWeek)) return true;
          
          return false;
        }).map(h => ({
          habit_id: h.id,
          user_id: user.user_id,
          date: todayStr,
          status: 'empty'
        }));

        if (logsToCreate.length > 0) {
          await supabase.from("habit_logs").upsert(logsToCreate, { onConflict: 'habit_id, date' });
          processedStart += logsToCreate.length;
        }
      }
    }

    // --- PHASE B: END OF DAY (23:xx) ---
    // Transition EMPTY -> FAILED. Trigger will handle HP damage and streak reset.
    if (endOfDayTzs.length > 0) {
      const todayStr = now.toISOString().split("T")[0];
      const { data: users } = await supabase.from("profiles").select("user_id").in("timezone", endOfDayTzs);
      const userIds = (users || []).map(u => u.user_id);

      if (userIds.length > 0) {
        const { count } = await supabase
          .from("habit_logs")
          .update({ status: 'failed' })
          .in("user_id", userIds)
          .eq("date", todayStr)
          .eq("status", 'empty');
        
        processedEnd = count || 0;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      generated_empty_logs: processedStart,
      marked_failed_logs: processedEnd
    }), { headers: { "Content-Type": "application/json" } });

  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { 
      status: 500, 
      headers: { "Content-Type": "application/json" } 
    });
  }
});

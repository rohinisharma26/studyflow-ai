import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";
import { generateSchedule } from "@/lib/scheduler";

export async function POST() {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  // Rule 7: wipe future, non-completed sessions before regenerating
  const { error: deleteError } = await supabase
    .from("study_sessions")
    .delete()
    .gte("scheduled_date", todayStr)
    .neq("status", "COMPLETED");

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  const { data: incompleteTasks, error: taskError } = await supabase
    .from("tasks")
    .select("*")
    .eq("status", "TODO");

  if (taskError) {
    return NextResponse.json({ error: taskError.message }, { status: 500 });
  }

  const plan = generateSchedule(incompleteTasks, today);

  if (plan.length > 0) {
    const { error: insertError } = await supabase.from("study_sessions").insert(plan);
    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
  }

  return NextResponse.json({ created: plan.length });
}
import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

// GET /api/sessions — all sessions, with their task info attached
export async function GET() {
  const { data, error } = await supabase
    .from("study_sessions")
    .select("*, tasks(title, subject)")
    .order("scheduled_date", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
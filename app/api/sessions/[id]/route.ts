import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

// PATCH /api/sessions/:id — mark complete/missed, log actual minutes
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const { data, error } = await supabase
    .from("study_sessions")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

// GET /api/tasks — return all tasks, nearest deadline first
export async function GET() {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("deadline", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// POST /api/tasks — create a new task
export async function POST(request: NextRequest) {
  const body = await request.json();

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      title: body.title,
      subject: body.subject,
      deadline: body.deadline,
      estimated_minutes: body.estimatedMinutes,
      difficulty: body.difficulty,
      status: "TODO",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}
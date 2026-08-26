import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { message } = await request.json();

  const today = new Date().toISOString().split("T")[0];

  const { data: todaysSessions } = await supabase
    .from("study_sessions")
    .select("*, tasks(title, subject)")
    .eq("scheduled_date", today)
    .eq("status", "SCHEDULED");

  const { data: upcomingTasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("status", "TODO")
    .order("deadline", { ascending: true })
    .limit(5);

  const contextText = `
Today's scheduled study sessions:
${(todaysSessions ?? []).map((s) => `- ${s.tasks?.title} (${s.tasks?.subject}), ${s.planned_minutes} min`).join("\n") || "None scheduled."}

Upcoming tasks (nearest deadline first):
${(upcomingTasks ?? []).map((t) => `- ${t.title} (${t.subject}), due ${t.deadline}, difficulty ${t.difficulty}`).join("\n") || "None."}
`;

  const prompt = `You are a study planning assistant. Here is the student's current data:\n${contextText}\n\nStudent's question: "${message}"\n\nGive a short, practical, encouraging answer.`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    }
  );

  const data = await response.json();
console.log("Gemini raw response:", JSON.stringify(data, null, 2));
const reply = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Sorry, I couldn't generate a response.";
  

  return NextResponse.json({ reply });
}
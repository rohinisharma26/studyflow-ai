"use client";

import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";

type Session = {
  id: number;
  scheduled_date: string;
  planned_minutes: number;
  actual_minutes: number | null;
  status: "SCHEDULED" | "COMPLETED" | "MISSED";
  tasks: { title: string; subject: string };
};

export default function PlannerPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    const res = await fetch("/api/sessions");
    const data = await res.json();
    setSessions(data);
  }

  async function generatePlan() {
    setGenerating(true);
    await fetch("/api/planner/generate", { method: "POST" });
    await loadSessions();
    setGenerating(false);
  }

  async function setStatus(id: number, status: "COMPLETED" | "MISSED") {
    await fetch(`/api/sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    loadSessions();
  }

  // Build a 7-day week starting from the most recent Monday
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sun..6=Sat
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

  const weekDays: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    weekDays.push(d);
  }

  function sessionsFor(date: Date) {
    const key = date.toISOString().split("T")[0];
    return sessions.filter((s) => s.scheduled_date === key);
  }

  const dayLabels = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  return (
    <div className="flex">
      <Sidebar active="/planner" />
      <main className="flex-1 md:ml-[240px] p-6 md:p-8 max-w-[1120px] mx-auto w-full">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl text-on-background mb-1">Weekly planner</h1>
            <p className="text-lg text-on-surface-variant">A gentle plan for the week ahead.</p>
          </div>
          <button
            onClick={generatePlan}
            disabled={generating}
            className="bg-primary text-on-primary text-sm px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            {generating ? "Generating..." : "Generate plan"}
          </button>
        </header>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
          <div className="grid grid-cols-7 border-b border-outline-variant bg-surface-bright">
            {dayLabels.map((day) => (
              <div key={day} className="p-3 text-center border-r border-outline-variant last:border-r-0">
                <span className="text-xs text-on-surface-variant uppercase tracking-wider">{day}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 min-h-[300px] bg-surface">
            {weekDays.map((day, i) => (
              <div key={i} className="border-r border-outline-variant last:border-r-0 p-2 flex flex-col gap-2">
                {sessionsFor(day).map((s) => (
                  <div
                    key={s.id}
                    className={
                      s.status === "COMPLETED"
                        ? "bg-secondary-fixed/40 border border-secondary-fixed rounded-lg p-3 opacity-70"
                        : s.status === "MISSED"
                        ? "bg-error-container/40 border border-error-container rounded-lg p-3"
                        : "bg-primary-fixed/30 border border-primary-fixed rounded-lg p-3"
                    }
                  >
                    <span className="inline-block px-2 py-0.5 rounded-full bg-black/5 text-[10px] mb-2">
                      {s.tasks?.subject}
                    </span>
                    <p className="text-sm text-on-background mb-1">{s.tasks?.title}</p>
                    <div className="flex items-center gap-1 text-on-surface-variant opacity-70 mb-2">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      <span className="text-[11px]">{s.planned_minutes} min</span>
                    </div>
                    {s.status === "SCHEDULED" && (
                      <div className="flex gap-2 text-[11px]">
                        <button onClick={() => setStatus(s.id, "COMPLETED")} className="text-primary">
                          Complete
                        </button>
                        <button onClick={() => setStatus(s.id, "MISSED")} className="text-error">
                          Missed
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
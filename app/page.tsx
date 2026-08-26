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

type Task = {
  id: number;
  title: string;
  deadline: string;
  status: "TODO" | "COMPLETED";
};

export default function Dashboard() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    fetch("/api/sessions")
      .then((r) => r.json())
      .then((data) => setSessions(Array.isArray(data) ? data : []));
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((data) => setTasks(Array.isArray(data) ? data : []));
  }, []);

  const todayStr = new Date().toISOString().split("T")[0];
  const todaysSessions = sessions.filter((s) => s.scheduled_date === todayStr);

  const upcomingTasks = tasks
    .filter((t) => t.status === "TODO")
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  const nextTask = upcomingTasks[0];

  function daysUntil(dateStr: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  // This week: Monday to Sunday
  const now = new Date();
  const dayOfWeek = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 7);

  const weekSessions = sessions.filter((s) => {
    const d = new Date(s.scheduled_date);
    return d >= monday && d < sunday;
  });

  const plannedMinutes = weekSessions.reduce((sum, s) => sum + s.planned_minutes, 0);
  const completedMinutes = weekSessions
    .filter((s) => s.status === "COMPLETED")
    .reduce((sum, s) => sum + (s.actual_minutes ?? s.planned_minutes), 0);
  const progressPercent = plannedMinutes > 0 ? Math.round((completedMinutes / plannedMinutes) * 100) : 0;

  return (
    <div className="flex">
      <Sidebar active="/" />
      <main className="flex-1 md:ml-[240px] p-6 md:p-8 max-w-[1120px] mx-auto w-full">
        <header className="mb-10">
          <h2 className="text-2xl md:text-3xl text-on-background">Good morning. Let's find your focus.</h2>
          <p className="text-lg text-on-surface-variant mt-2">Your personalized academic dashboard.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <section className="bg-surface-container-lowest border border-surface-variant rounded-xl p-8">
              <span className="inline-block px-3 py-1 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed text-xs mb-3">
                Today
              </span>
              {todaysSessions.length === 0 ? (
                <p className="text-on-surface-variant">
                  Nothing scheduled for today. Generate a plan from the Weekly Planner.
                </p>
              ) : (
                <div className="space-y-3">
                  {todaysSessions.map((s) => (
                    <div key={s.id} className="flex justify-between items-center border-b border-surface-variant last:border-b-0 pb-2 last:pb-0">
                      <div>
                        <p className="text-on-background">{s.tasks?.title}</p>
                        <p className="text-xs text-on-surface-variant">{s.tasks?.subject}</p>
                      </div>
                      <span className="text-sm text-on-surface-variant">
                        {s.planned_minutes} min {s.status === "COMPLETED" && "· Done"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="flex justify-between items-center mb-4 border-b border-surface-variant pb-2">
                <h3 className="text-lg text-on-background">Upcoming</h3>
              </div>
              {upcomingTasks.length === 0 ? (
                <p className="text-on-surface-variant">No upcoming tasks.</p>
              ) : (
                <div className="space-y-2">
                  {upcomingTasks.slice(0, 5).map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-4 bg-surface-container-lowest border border-surface-variant rounded-lg"
                    >
                      <p className="text-on-surface">{t.title}</p>
                      <span className="text-sm text-on-surface-variant">
                        {daysUntil(t.deadline)} day{daysUntil(t.deadline) === 1 ? "" : "s"} left
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <section className="bg-surface-container-lowest border border-surface-variant rounded-xl p-6">
              <h3 className="text-lg text-on-background mb-2">Next Deadline</h3>
              {nextTask ? (
                <>
                  <p className="text-on-surface">{nextTask.title}</p>
                  <p className="text-sm text-on-surface-variant mt-1">
                    {daysUntil(nextTask.deadline)} day{daysUntil(nextTask.deadline) === 1 ? "" : "s"} left
                  </p>
                </>
              ) : (
                <p className="text-on-surface-variant text-sm">No upcoming exams.</p>
              )}
            </section>

            <section className="bg-surface-container-lowest border border-surface-variant rounded-xl p-6">
              <h3 className="text-lg text-on-background mb-4">This Week</h3>
              <div className="flex justify-between text-sm mb-2">
                <span>{completedMinutes} of {plannedMinutes} min</span>
                <span className="text-on-surface-variant">{progressPercent}%</span>
              </div>
              <div className="w-full bg-surface-variant rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: `${Math.min(progressPercent, 100)}%` }}
                />
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
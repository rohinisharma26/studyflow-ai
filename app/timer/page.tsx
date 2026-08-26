"use client";

import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";

type Session = {
  id: number;
  scheduled_date: string;
  planned_minutes: number;
  status: "SCHEDULED" | "COMPLETED" | "MISSED";
  tasks: { title: string; subject: string };
};

export default function TimerPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    const res = await fetch("/api/sessions");
    const data = await res.json();
    if (Array.isArray(data)) {
      const todayStr = new Date().toISOString().split("T")[0];
      setSessions(
        data.filter((s: Session) => s.status === "SCHEDULED" && s.scheduled_date === todayStr)
      );
    }
  }

  useEffect(() => {
    if (!running) return;
    if (secondsLeft === 0) {
      handleComplete();
      return;
    }
    const timeout = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timeout);
  }, [running, secondsLeft]);

  async function handleComplete() {
    setRunning(false);
    if (!selectedId) return;

    const elapsedMinutes = Math.round((25 * 60 - secondsLeft) / 60) || 25;

    await fetch(`/api/sessions/${selectedId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "COMPLETED", actual_minutes: elapsedMinutes }),
    });

    setJustCompleted(true);
    setSelectedId(null);
    setSecondsLeft(25 * 60);
    loadSessions();
  }

  function reset() {
    setRunning(false);
    setSecondsLeft(25 * 60);
    setJustCompleted(false);
  }

  const minutes = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const time = `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  return (
    <div className="flex">
      <Sidebar active="/timer" />
      <main className="flex-1 md:ml-[240px] p-6 md:p-8 max-w-[1120px] mx-auto w-full flex flex-col xl:flex-row gap-10">
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl text-on-background mb-2">Focus timer</h2>
            <p className="text-lg text-on-surface-variant">One quiet session at a time.</p>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 w-full max-w-md flex flex-col items-center">
            {justCompleted && (
              <p className="text-sm text-primary mb-4">Session saved. Nice work.</p>
            )}

            <select
              value={selectedId ?? ""}
              onChange={(e) => {
                setSelectedId(Number(e.target.value) || null);
                setSecondsLeft(25 * 60);
                setRunning(false);
                setJustCompleted(false);
              }}
              className="border border-outline-variant rounded-lg p-2 w-full mb-6"
            >
              <option value="">Select today's session</option>
              {sessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.tasks?.title} ({s.tasks?.subject}) - {s.planned_minutes} min
                </option>
              ))}
            </select>

            {sessions.length === 0 && (
              <p className="text-sm text-on-surface-variant mb-6 text-center">
                No sessions scheduled for today. Generate a plan first.
              </p>
            )}

            <div className="relative w-64 h-64 mb-10 flex items-center justify-center">
              <span className="text-6xl text-primary font-medium tracking-tight">{time}</span>
            </div>

            <div className="flex gap-4 w-full">
              <button
                onClick={reset}
                className="flex-1 bg-surface-container-lowest border border-outline-variant text-on-background text-sm py-3 rounded-lg flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[20px]">stop</span>
                Reset
              </button>
              <button
                onClick={() => setRunning(!running)}
                disabled={!selectedId}
                className="flex-1 bg-primary text-on-primary text-sm py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {running ? "pause" : "play_arrow"}
                </span>
                {running ? "Pause" : "Start"}
              </button>
            </div>

            <p className="text-sm text-on-surface-variant mt-6 text-center opacity-70">
              Take a short break when this session ends.
            </p>
          </div>
        </div>

        <div className="w-full xl:w-80">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6">
            <h3 className="text-lg text-on-background mb-4">Today's sessions</h3>
            <div className="flex flex-col gap-4">
              {sessions.length === 0 && (
                <p className="text-sm text-on-surface-variant">Nothing scheduled today.</p>
              )}
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className={
                    s.id === selectedId
                      ? "flex items-start gap-3 p-3 rounded-lg bg-primary-fixed/20 border border-primary/20"
                      : "flex items-start gap-3 p-3 rounded-lg"
                  }
                >
                  <span className="material-symbols-outlined text-outline mt-0.5">
                    {s.id === selectedId ? "radio_button_checked" : "radio_button_unchecked"}
                  </span>
                  <div>
                    <h4 className="text-sm text-on-surface-variant">{s.tasks?.title}</h4>
                    <p className="text-xs text-outline">{s.planned_minutes} min</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
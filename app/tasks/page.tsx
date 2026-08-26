"use client";

import Sidebar from "@/components/Sidebar";
import { useEffect, useState } from "react";

type Task = {
  id: number;
  title: string;
  subject: string;
  deadline: string;
  estimated_minutes: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  status: "TODO" | "COMPLETED";
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [deadline, setDeadline] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState(60);
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    const res = await fetch("/api/tasks");
    const data = await res.json();
    setTasks(data);
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, subject, deadline, estimatedMinutes, difficulty }),
    });
    setTitle("");
    setSubject("");
    setDeadline("");
    setEstimatedMinutes(60);
    loadTasks();
  }

  async function markComplete(id: number) {
    await fetch(`/api/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "COMPLETED" }),
    });
    loadTasks();
  }

  async function deleteTask(id: number) {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    loadTasks();
  }

  return (
    <div className="flex">
      <Sidebar active="/tasks" />
      <main className="flex-1 md:ml-[240px] flex justify-center">
        <div className="w-full max-w-[1120px] px-4 md:px-8 py-8 md:py-12">
          <header className="mb-8 max-w-2xl">
            <h2 className="text-3xl text-on-surface mb-2 tracking-tight">The Library of Tasks</h2>
            <p className="text-lg text-on-surface-variant">A curated collection of focused endeavors.</p>
          </header>

          <form
            onSubmit={addTask}
            className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 mb-10 flex flex-col gap-3"
          >
            <input
              placeholder="Task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border border-outline-variant rounded-lg p-2"
              required
            />
            <input
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="border border-outline-variant rounded-lg p-2"
              required
            />
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="border border-outline-variant rounded-lg p-2"
              required
            />
            <input
              type="number"
              placeholder="Estimated minutes"
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
              className="border border-outline-variant rounded-lg p-2"
            />
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as "EASY" | "MEDIUM" | "HARD")}
              className="border border-outline-variant rounded-lg p-2"
            >
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>
            <button type="submit" className="bg-primary text-on-primary rounded-lg py-2">
              Add Task
            </button>
          </form>

          <div className="space-y-2 pb-32">
            {tasks.length === 0 && (
              <p className="text-on-surface-variant">No tasks yet — add one above.</p>
            )}
            {tasks.map((task) => (
              <div
                key={task.id}
                className="group flex items-center gap-4 p-4 bg-surface-container-lowest border border-outline-variant rounded-lg"
              >
                <input
                  type="checkbox"
                  checked={task.status === "COMPLETED"}
                  onChange={() => markComplete(task.id)}
                  className="w-5 h-5 rounded-sm border-outline text-primary"
                />
                <div className="flex-1 min-w-0">
                  <span
                    className={
                      task.status === "COMPLETED"
                        ? "line-through text-on-surface-variant"
                        : "text-on-surface"
                    }
                  >
                    {task.title} — {task.subject}
                  </span>
                  <div className="flex items-center gap-3 mt-1 text-sm text-on-surface-variant">
                    <span>Due {new Date(task.deadline).toLocaleDateString()}</span>
                    <span>{task.estimated_minutes} min</span>
                    <span>{task.difficulty}</span>
                  </div>
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-error text-sm opacity-0 group-hover:opacity-100"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
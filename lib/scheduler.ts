type TaskInput = {
  id: number;
  deadline: string;
  estimated_minutes: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
};

type PlannedSession = {
  task_id: number;
  scheduled_date: string;
  planned_minutes: number;
};

const difficultyRank = { HARD: 0, MEDIUM: 1, EASY: 2 };

export function generateSchedule(tasks: TaskInput[], startDate: Date): PlannedSession[] {
  // Rule 1 & 2: sort by nearest deadline; harder task first on ties
  const sorted = [...tasks].sort((a, b) => {
    const dateDiff = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    if (dateDiff !== 0) return dateDiff;
    return difficultyRank[a.difficulty] - difficultyRank[b.difficulty];
  });

  const sessions: PlannedSession[] = [];
  const dailyRemaining = new Map<string, number>();

  function capacityForDate(date: Date): number {
    const day = date.getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = day === 0 || day === 6;
    return isWeekend ? 240 : 120; // 4 hrs weekend, 2 hrs weekday
  }

  function remainingOn(date: Date): number {
    const key = date.toDateString();
    if (!dailyRemaining.has(key)) {
      dailyRemaining.set(key, capacityForDate(date));
    }
    return dailyRemaining.get(key)!;
  }

  function useMinutes(date: Date, minutes: number) {
    const key = date.toDateString();
    dailyRemaining.set(key, remainingOn(date) - minutes);
  }

  for (const task of sorted) {
    let minutesLeft = task.estimated_minutes;
    const cursor = new Date(startDate);
    const deadline = new Date(task.deadline);

    // Rule 5: never schedule past the deadline
    while (minutesLeft > 0 && cursor <= deadline) {
      const available = remainingOn(cursor);
      if (available > 0) {
        // Rule 3: split into 25 or 50 minute chunks
        const chunk = Math.min(available, minutesLeft, minutesLeft >= 50 ? 50 : 25);
        sessions.push({
          task_id: task.id,
          scheduled_date: cursor.toISOString().split("T")[0], // YYYY-MM-DD
          planned_minutes: chunk,
        });
        useMinutes(cursor, chunk);
        minutesLeft -= chunk;
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    // Rule 6: leftover minutesLeft here means it didn't fully fit — "needs more time"
  }

  return sessions;
}
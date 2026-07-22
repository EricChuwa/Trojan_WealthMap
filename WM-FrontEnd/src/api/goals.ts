import { authFetch } from "./auth";

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  monthsLeft: number;
  category: "savings" | "purchase" | "emergency" | "investment";
  status: "active" | "completed" | "abandoned";
}

export async function fetchGoals(): Promise<Goal[]> {
  const res = await authFetch("/goals");
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to load goals");
  }
  const result = await res.json();
  return result.goals;
}

export async function createGoal(data: {
  name: string;
  category: Goal["category"];
  targetAmount: number;
  monthsLeft: number;
}): Promise<Goal> {
  const res = await authFetch("/goals", {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create goal");
  }
  const result = await res.json();
  return result.goal;
}

export async function updateGoal(
  id: string,
  data: {
    name: string;
    category: Goal["category"];
    targetAmount: number;
    savedAmount: number;
    monthsLeft: number;
  },
): Promise<Goal> {
  const res = await authFetch(`/goals/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update goal");
  }
  const result = await res.json();
  return result.goal;
}

export async function deleteGoal(id: string): Promise<void> {
  const res = await authFetch(`/goals/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to delete goal");
  }
}

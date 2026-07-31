import { authFetch } from "./auth";
import { currentMonth } from "./flow";

export interface Allocations {
  needs: number;
  wants: number;
  savings: number;
}

export interface BudgetResponse {
  budgetId: number;
  totalIncome?: number;
  allocations: Allocations;
}

export async function createBudgetApi(
  income: number,
  month: string = currentMonth()
): Promise<BudgetResponse> {
  const res = await authFetch("/budget", {
    method: "POST",
    body: JSON.stringify({ month, income }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.message || "Failed to create budget");
  }

  return body as BudgetResponse;
}

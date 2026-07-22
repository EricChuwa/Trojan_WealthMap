import { getToken } from "./auth";

const API_URL = import.meta.env.VITE_API_URL;

export interface FlowItem {
  item_id: string;
  name: string;
  planned_amount: number;
  is_allocated: boolean;
  is_paid: boolean;
  sort_order: number;
}

export interface FlowGroup {
  group_id: string;
  name: string;
  category: "need" | "want" | "saving";
  is_example: boolean;
  planned: number;
  spent: number;
  items: FlowItem[];
}

export interface FlowMonth {
  success: boolean;
  month: string;
  budget: {
    budget_id: string;
    income: number;
    tier_applied: string | null;
    needs_alloc: number;
    wants_alloc: number;
    savings_alloc: number;
  } | null;
  totals: {
    money_in: number;
    money_out: number;
    net: number;
    protected: number;
    spendable: number;
  };
  groups: FlowGroup[];
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.message || `Request failed (${res.status})`);
  }
  return body as T;
}

export function getFlowMonth(month: string) {
  return request<FlowMonth>(`/flow/${month}`);
}

export function createGroup(name: string, category: FlowGroup["category"]) {
  return request<{ group: FlowGroup }>("/flow/groups", {
    method: "POST",
    body: JSON.stringify({ name, category }),
  });
}

export function updateGroup(
  groupId: string,
  data: { name?: string; category?: FlowGroup["category"] },
) {
  return request<{ group: FlowGroup }>(`/flow/groups/${groupId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export interface FlowTransaction {
  txn_id: string;
  type: "income" | "expense";
  amount: number;
  txn_date: string;
  source: string | null;
  note: string | null;
  item_name: string | null;
  group_name: string | null;
  category: FlowGroup["category"] | null;
  is_allocated: boolean | null;
  is_paid: boolean | null;
}

export interface FlowLedger {
  success: boolean;
  month: string;
  totals: { money_in: number; money_out: number; net: number };
  transactions: FlowTransaction[];
}

export function getTransactions(month: string) {
  return request<FlowLedger>(`/flow/${month}/transactions`);
}

export function createItem(data: {
  group_id: string;
  month: string;
  name: string;
  planned_amount?: number;
}) {
  return request<{ item: FlowItem }>("/flow/items", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateItem(
  itemId: string,
  data: {
    name?: string;
    planned_amount?: number;
    is_allocated?: boolean;
    is_paid?: boolean;
  },
) {
  return request<{ item: FlowItem }>(`/flow/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export function deleteItem(itemId: string) {
  return request<{ message: string }>(`/flow/items/${itemId}`, {
    method: "DELETE",
  });
}

export function deleteGroup(groupId: string) {
  return request<{ message: string }>(`/flow/groups/${groupId}`, {
    method: "DELETE",
  });
}

// "2026-07" for the current month
export function currentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function formatMonth(month: string): string {
  const [year, m] = month.split("-");
  const date = new Date(Number(year), Number(m) - 1, 1);
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

export function shiftMonth(month: string, delta: number): string {
  const [year, m] = month.split("-").map(Number);
  const date = new Date(year, m - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
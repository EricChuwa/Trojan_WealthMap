const API_URL = import.meta.env.VITE_API_URL;

let currentToken: string | null = null;

export function getToken() {
  return currentToken;
}

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  country: string;
  age: number;
  field: string;
}) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || "Registration failed");
  }
  return res.json();
}

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error("Invalid credentials");
  }
  const result = await res.json();
  currentToken = result.token;
  return result;
}

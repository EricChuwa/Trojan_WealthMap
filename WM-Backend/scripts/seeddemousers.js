// Seeds several demo accounts with three-plus months of realistic MoMo
// activity, using only the app's existing, already-tested HTTP endpoints —
// register, login, and the SMS simulator. Nothing here talks to the
// database directly, and no new API route is added: this is a client of
// the API, exactly like the frontend is, just scripted.
//
// Usage:
//   node scripts/seedDemoUsers.js
//   node scripts/seedDemoUsers.js --users=5 --count=90 --months=3 --failureRate=0.08
//
// Requires the backend to already be running (npm start in another shell).

const API_URL = process.env.SEED_API_URL || "http://localhost:5000/api";

function arg(name, fallback) {
  const match = process.argv.find((a) => a.startsWith(`--${name}=`));
  return match ? match.split("=")[1] : fallback;
}

const NUM_USERS = Number(arg("users", 4));
const COUNT = Number(arg("count", 90));
const MONTHS = Number(arg("months", 3));
const FAILURE_RATE = Number(arg("failureRate", 0.08));

const FIRST_NAMES = ["Eric", "Aline", "Jean", "Sarah", "Claude", "Grace", "Divine", "Patrick"];
const LAST_NAMES = ["Mugisha", "Uwase", "Kagabo", "Nshuti", "Iradukunda", "Habimana"];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function post(path, body, token) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, body: json };
}

async function createDemoUser(index) {
  const firstName = pick(FIRST_NAMES);
  const lastName = pick(LAST_NAMES);
  const email = `demo.${firstName.toLowerCase()}.${Date.now()}.${index}@wealthmap.rw`;
  const password = "DemoPass123!";

  const register = await post("/auth/register", {
    first_name: firstName,
    last_name: lastName,
    email,
    password,
    country: "RW",
  });
  if (register.status !== 201) {
    throw new Error(`Register failed for user ${index}: ${JSON.stringify(register.body)}`);
  }

  const login = await post("/auth/login", { email, password });
  if (login.status !== 200 || !login.body.token) {
    throw new Error(`Login failed for user ${index}: ${JSON.stringify(login.body)}`);
  }

  return { email, name: `${firstName} ${lastName}`, token: login.body.token };
}

async function simulateForUser(user) {
  const result = await post(
    "/flow/sms/simulate",
    { count: COUNT, months: MONTHS, failure_rate: FAILURE_RATE },
    user.token,
  );
  return result;
}

async function main() {
  console.log(
    `Seeding ${NUM_USERS} demo user(s), ${COUNT} messages each, spread over ${MONTHS} month(s), ~${Math.round(FAILURE_RATE * 100)}% simulated failures.\n`,
  );

  for (let i = 1; i <= NUM_USERS; i++) {
    try {
      const user = await createDemoUser(i);
      console.log(`[${i}/${NUM_USERS}] Logged in as ${user.name} <${user.email}>`);

      const sim = await simulateForUser(user);
      if (sim.status !== 201) {
        console.log(`    ✗ simulate failed: ${JSON.stringify(sim.body)}`);
        continue;
      }

      const { created, failed, skipped, months } = sim.body;
      console.log(
        `    ✓ ${created} transactions created, ${failed} correctly recognised as failed and excluded, ${skipped} skipped, spread over ${months} month(s).`,
      );
    } catch (err) {
      console.log(`[${i}/${NUM_USERS}] ✗ ${err.message}`);
    }
  }

  console.log("\nDone. Each printed email/password (DemoPass123!) is a working login.");
}

main().catch((err) => {
  console.error("Seed script failed:", err);
  process.exit(1);
});
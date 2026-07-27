const pool = require("../config/db");
const { parseMoMoMessage } = require("../utils/smsParser");

// Finds (or creates) the budget row for the month a transaction falls in,
// so every transaction is attached to a month even before payday is set up.
const ensureBudgetForDate = async (userId, txnDate) => {
  const month = String(txnDate).slice(0, 7);
  const existing = await pool.query(
    `SELECT budget_id FROM budgets WHERE user_id = $1 AND month = $2`,
    [userId, month],
  );
  if (existing.rows[0]) return existing.rows[0].budget_id;

  const created = await pool.query(
    `INSERT INTO budgets (user_id, month, income, needs_alloc, wants_alloc, savings_alloc)
     VALUES ($1, $2, 0, 0, 0, 0)
     RETURNING budget_id`,
    [userId, month],
  );
  return created.rows[0].budget_id;
};

// Stores a parsed message. Returns { duplicate: true } if we've already
// seen this provider reference — re-ingesting must never double-count money.
const storeTransaction = async (userId, parsed) => {
  const budgetId = await ensureBudgetForDate(userId, parsed.txn_date);

  if (parsed.external_ref) {
    const seen = await pool.query(
      `SELECT txn_id FROM transactions
        WHERE user_id = $1 AND external_ref = $2`,
      [userId, parsed.external_ref],
    );
    if (seen.rows[0]) {
      return { duplicate: true, txn_id: seen.rows[0].txn_id };
    }
  }

  const result = await pool.query(
    `INSERT INTO transactions
       (user_id, budget_id, type, amount, txn_date, source, note,
        balance_after, raw_message, counterparty, external_ref, needs_review)
     VALUES ($1, $2, $3, $4, $5, 'momo', $6, $7, $8, $9, $10, TRUE)
     RETURNING txn_id, type, amount, txn_date, counterparty,
               balance_after, external_ref, needs_review`,
    [
      userId,
      budgetId,
      parsed.type,
      parsed.amount,
      parsed.txn_date,
      parsed.counterparty,
      parsed.balance_after,
      parsed.raw_message,
      parsed.counterparty,
      parsed.external_ref,
    ],
  );

  const row = result.rows[0];
  return {
    duplicate: false,
    transaction: {
      ...row,
      amount: Number(row.amount),
      balance_after: row.balance_after === null ? null : Number(row.balance_after),
    },
  };
};

// POST /api/flow/sms   { message }
// The live SMS feed and the simulator both land here.
const ingestSms = async (req, res) => {
  const { message } = req.body;
  const userId = req.user.id;

  const parsed = parseMoMoMessage(message);
  if (!parsed.ok) {
    return res.status(422).json({
      success: false,
      message: parsed.reason,
      raw_message: message,
    });
  }

  try {
    const result = await storeTransaction(userId, parsed.data);
    if (result.duplicate) {
      return res.status(200).json({
        success: true,
        duplicate: true,
        message: "Already recorded — ignored.",
      });
    }
    res.status(201).json({
      success: true,
      duplicate: false,
      transaction: result.transaction,
    });
  } catch (err) {
    console.error("Ingest SMS error:", err);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again." });
  }
};

// ---------------------------------------------------------------------------
// Simulator — generates realistic messages and feeds them through the exact
// same path the real SMS feed would use, so nothing changes when we swap in
// a live provider.
// ---------------------------------------------------------------------------

const SENDERS = [
  "MUGISHA ERIC", "UWASE ALINE", "KAGABO JEAN", "EMPLOYER LTD",
  "NSHUTI CLAUDE", "IRADUKUNDA SARAH",
];
const MERCHANTS = [
  "KABEZA SHOP", "SIMBA SUPERMARKET", "NET CAFE KG9", "MOTO TAXI",
  "AMEKI COLOR", "CANAL PLUS RWANDA", "REG ELECTRICITY", "BRALIRWA DEPOT",
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomAmount = (min, max, step = 500) =>
  Math.round((Math.random() * (max - min) + min) / step) * step;

const makeRef = () =>
  String(Math.floor(Math.random() * 9e10) + 1e10);

// Realistic failure notifications. These deliberately mirror real transaction
// wording (amount, merchant/recipient) so the parser has to actually
// recognise the failure phrase rather than just "no amount found" — proving
// the parser distinguishes "understood, and it failed" from "gibberish".
function buildFailedMessage(dateStr) {
  const amt = randomAmount(1000, 60000, 500);
  const templates = [
    () =>
      `Your payment of ${amt.toLocaleString("en-US")} RWF to ${pick(MERCHANTS)} has failed due to insufficient balance. Please top up and try again. ${dateStr}`,
    () =>
      `Your transaction of ${amt.toLocaleString("en-US")} RWF to ${pick(SENDERS)} was declined. Please contact your service provider. ${dateStr}`,
    () =>
      `Transaction failed: incorrect PIN entered. Your payment of ${amt.toLocaleString("en-US")} RWF was not completed. ${dateStr}`,
    () =>
      `Your transaction of ${amt.toLocaleString("en-US")} RWF could not be completed due to network error. Please try again later. ${dateStr}`,
    () =>
      `Transfer of ${amt.toLocaleString("en-US")} RWF failed: recipient number not registered on Mobile Money. ${dateStr}`,
    () =>
      `This transaction of ${amt.toLocaleString("en-US")} RWF exceeds your daily limit. ${dateStr}`,
  ];
  return { amount: amt, text: pick(templates)() };
}

function buildMessage(kind, balance, dateStr) {
  if (kind === "salary") {
    const amt = randomAmount(80000, 450000, 5000);
    return {
      amount: amt,
      text: `You have received ${amt.toLocaleString("en-US")} RWF from EMPLOYER LTD (250788000111) on your mobile money account at ${dateStr} 08:15:02. Your new balance: ${(balance + amt).toLocaleString("en-US")} RWF. Financial Transaction Id: ${makeRef()}.`,
    };
  }
  if (kind === "received") {
    const amt = randomAmount(2000, 40000);
    return {
      amount: amt,
      text: `You have received ${amt.toLocaleString("en-US")} RWF from ${pick(SENDERS)} (2507881234${Math.floor(Math.random() * 90 + 10)}) on your mobile money account at ${dateStr} 14:22:41. Your new balance: ${(balance + amt).toLocaleString("en-US")} RWF. Financial Transaction Id: ${makeRef()}.`,
    };
  }
  if (kind === "withdrawal") {
    const amt = randomAmount(5000, 50000, 1000);
    return {
      amount: -amt,
      text: `You have withdrawn ${amt.toLocaleString("en-US")} RWF from agent ${Math.floor(Math.random() * 9000 + 1000)} at ${dateStr} 16:05:11. Your new balance: ${Math.max(0, balance - amt).toLocaleString("en-US")} RWF. Financial Transaction Id: ${makeRef()}.`,
    };
  }
  const amt = randomAmount(500, 35000, 100);
  return {
    amount: -amt,
    text: `Your payment of ${amt.toLocaleString("en-US")} RWF to ${pick(MERCHANTS)} ${Math.floor(Math.random() * 90000 + 10000)} has been completed at ${dateStr} 12:40:09. Your new balance: ${Math.max(0, balance - amt).toLocaleString("en-US")} RWF. Fee was 0 RWF. Financial Transaction Id: ${makeRef()}.`,
  };
}

// POST /api/flow/sms/simulate
//   { count?, kind?, months?, failure_rate?, starting_balance? }
// kind: salary | received | payment | withdrawal | mixed (default)
// months: how far back to spread messages (default 3, min 1, max 12)
// failure_rate: fraction of generated messages that are failed transactions
//   (default 0.08 = ~8%). Failed messages are parsed, correctly recognised,
//   and deliberately NOT stored — this proves the parser tells a real
//   transaction apart from one that never went through.
const simulateSms = async (req, res) => {
  const userId = req.user.id;
  const count = Math.min(Math.max(Number(req.body.count) || 60, 1), 500);
  const kind = req.body.kind || "mixed";
  const months = Math.min(Math.max(Number(req.body.months) || 3, 1), 12);
  const failureRate = Math.min(
    Math.max(req.body.failure_rate !== undefined ? Number(req.body.failure_rate) : 0.08, 0),
    1,
  );
  const spanDays = months * 30;

  try {
    const last = await pool.query(
      `SELECT balance_after FROM transactions
        WHERE user_id = $1 AND balance_after IS NOT NULL
        ORDER BY txn_date DESC, created_at DESC LIMIT 1`,
      [userId],
    );
    let balance =
      req.body.starting_balance !== undefined
        ? Number(req.body.starting_balance)
        : last.rows[0]
          ? Number(last.rows[0].balance_after)
          : 0;

    const created = [];
    const failed = [];
    const skipped = [];

    // Build the (date, isFailure) plan first, then sort chronologically so
    // the running balance accumulates in real order rather than randomly —
    // otherwise a message dated "yesterday" could be built after one dated
    // "next week" and the balance trail wouldn't make sense.
    const plan = [];
    for (let i = 0; i < count; i++) {
      const d = new Date();
      d.setDate(d.getDate() - Math.floor(Math.random() * spanDays));
      plan.push({ date: d, isFailure: Math.random() < failureRate });
    }
    plan.sort((a, b) => a.date - b.date);

    for (const step of plan) {
      const dateStr = step.date.toISOString().slice(0, 10);

      if (step.isFailure) {
        const built = buildFailedMessage(dateStr);
        const parsed = parseMoMoMessage(built.text);
        // Balance is deliberately untouched — the money never moved.
        if (parsed.ok === false && parsed.isFailedTxn) {
          failed.push({ message: built.text, reason: parsed.reason });
        } else {
          // Parser didn't recognise our own failure template — a bug, not
          // expected in normal operation, but surfaced rather than hidden.
          skipped.push({ message: built.text, reason: "unrecognised failure template" });
        }
        continue;
      }

      let thisKind = kind;
      if (kind === "mixed") {
        const roll = Math.random();
        thisKind =
          roll < 0.1 ? "salary" : roll < 0.3 ? "received" : roll < 0.85 ? "payment" : "withdrawal";
      }

      const built = buildMessage(thisKind, balance, dateStr);
      balance = Math.max(0, balance + built.amount);

      const parsed = parseMoMoMessage(built.text);
      if (!parsed.ok) {
        skipped.push({ message: built.text, reason: parsed.reason });
        continue;
      }
      const stored = await storeTransaction(userId, parsed.data);
      if (stored.duplicate) {
        skipped.push({ message: built.text, reason: "duplicate" });
      } else {
        created.push({ ...stored.transaction, raw_message: built.text });
      }
    }

    res.status(201).json({
      success: true,
      months,
      requested: count,
      created: created.length,
      failed: failed.length,
      skipped: skipped.length,
      balance_after: balance,
      transactions: created,
      failed_transactions: failed,
    });
  } catch (err) {
    console.error("Simulate SMS error:", err);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again." });
  }
};

// GET /api/flow/inbox — transactions still awaiting categorisation
const getInbox = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query(
      `SELECT txn_id, type, amount, txn_date, counterparty,
              balance_after, raw_message, source
         FROM transactions
        WHERE user_id = $1 AND needs_review = TRUE
        ORDER BY txn_date DESC, created_at DESC`,
      [userId],
    );
    res.status(200).json({
      success: true,
      count: result.rowCount,
      transactions: result.rows.map((r) => ({
        ...r,
        amount: Number(r.amount),
        balance_after: r.balance_after === null ? null : Number(r.balance_after),
      })),
    });
  } catch (err) {
    console.error("Get inbox error:", err);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again." });
  }
};

// PATCH /api/flow/transactions/:txnId   { item_id }
// Assigning a transaction to an item clears it from the inbox and marks
// that item paid — the money actually moved.
const assignTransaction = async (req, res) => {
  const { txnId } = req.params;
  const { item_id } = req.body;
  const userId = req.user.id;

  try {
    if (item_id) {
      const owns = await pool.query(
        `SELECT i.item_id FROM expense_items i
           JOIN expense_groups g ON g.group_id = i.group_id
          WHERE i.item_id = $1 AND g.user_id = $2`,
        [item_id, userId],
      );
      if (owns.rowCount === 0) {
        return res
          .status(404)
          .json({ success: false, message: "Item not found." });
      }
    }

    const result = await pool.query(
      `UPDATE transactions
          SET item_id = $3, needs_review = FALSE
        WHERE txn_id = $1 AND user_id = $2
        RETURNING txn_id, item_id, type, amount, needs_review`,
      [txnId, userId, item_id || null],
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found." });
    }

    // An expense that actually happened means the item is paid.
    if (item_id && result.rows[0].type === "expense") {
      await pool.query(
        `UPDATE expense_items SET is_paid = TRUE, updated_at = NOW()
          WHERE item_id = $1`,
        [item_id],
      );
    }

    res.status(200).json({
      success: true,
      transaction: { ...result.rows[0], amount: Number(result.rows[0].amount) },
    });
  } catch (err) {
    if (err.code === "22P02") {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found." });
    }
    console.error("Assign transaction error:", err);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again." });
  }
};

module.exports = { ingestSms, simulateSms, getInbox, assignTransaction };
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

// POST /api/flow/sms/simulate   { count?, kind?, starting_balance? }
// kind: salary | received | payment | withdrawal | mixed (default)
const simulateSms = async (req, res) => {
  const userId = req.user.id;
  const count = Math.min(Math.max(Number(req.body.count) || 1, 1), 30);
  const kind = req.body.kind || "mixed";

  try {
    // Continue from the last known balance so the running total stays coherent.
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
    const skipped = [];

    for (let i = 0; i < count; i++) {
      // Spread messages over the last two weeks, newest last.
      const d = new Date();
      d.setDate(d.getDate() - Math.floor(Math.random() * 14));
      const dateStr = d.toISOString().slice(0, 10);

      let thisKind = kind;
      if (kind === "mixed") {
        const roll = Math.random();
        thisKind =
          roll < 0.15 ? "salary" : roll < 0.35 ? "received" : roll < 0.85 ? "payment" : "withdrawal";
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
      created: created.length,
      skipped: skipped.length,
      balance_after: balance,
      transactions: created,
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
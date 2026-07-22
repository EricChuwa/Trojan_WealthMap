// Parses mobile money SMS notifications into structured transactions.
//
// Rwandan MoMo messages have no category labels — they only tell us the
// direction, the amount, usually the new balance, and who the other party
// was. Categorising is left to the user, which is why every parsed
// transaction starts with needs_review = true.
//
// Formats vary by provider and change over time, so each field has several
// patterns and we always keep the raw message for re-parsing later.

const AMOUNT = String.raw`([\d,]+(?:\.\d{1,2})?)`;
const CUR = String.raw`(?:RWF|FRW|RF)`;

// Anything that means money arrived.
const INCOMING_PATTERNS = [
  new RegExp(String.raw`you have received\s+${AMOUNT}\s*${CUR}`, "i"),
  new RegExp(String.raw`you have received\s+${CUR}\s*${AMOUNT}`, "i"),
  new RegExp(String.raw`received\s+${CUR}\s*${AMOUNT}`, "i"),
  new RegExp(String.raw`deposit of\s+${AMOUNT}\s*${CUR}`, "i"),
  new RegExp(String.raw`credited with\s+${AMOUNT}\s*${CUR}`, "i"),
];

// Anything that means money left.
const OUTGOING_PATTERNS = [
  new RegExp(String.raw`your payment of\s+${AMOUNT}\s*${CUR}`, "i"),
  new RegExp(String.raw`you have sent\s+${AMOUNT}\s*${CUR}`, "i"),
  new RegExp(String.raw`you have sent\s+${CUR}\s*${AMOUNT}`, "i"),
  new RegExp(String.raw`sent\s+${CUR}\s*${AMOUNT}`, "i"),
  new RegExp(String.raw`transferred\s+${AMOUNT}\s*${CUR}`, "i"),
  new RegExp(String.raw`withdrawn\s+${AMOUNT}\s*${CUR}`, "i"),
  new RegExp(String.raw`paid\s+${AMOUNT}\s*${CUR}`, "i"),
  new RegExp(String.raw`debited\s+${AMOUNT}\s*${CUR}`, "i"),
];

const BALANCE_PATTERNS = [
  new RegExp(String.raw`new balance[:\s]+${AMOUNT}\s*${CUR}`, "i"),
  new RegExp(String.raw`new balance[:\s]+${CUR}\s*${AMOUNT}`, "i"),
  new RegExp(String.raw`balance[:\s]+${AMOUNT}\s*${CUR}`, "i"),
  new RegExp(String.raw`balance[:\s]+${CUR}\s*${AMOUNT}`, "i"),
];

const REF_PATTERNS = [
  /financial transaction id[:\s]+([A-Za-z0-9]+)/i,
  /transaction id[:\s]+([A-Za-z0-9]+)/i,
  /\bTID[:\s]+([A-Za-z0-9]+)/i,
  /\bref[:\s.]+([A-Za-z0-9]+)/i,
];

const FEE_PATTERNS = [
  new RegExp(String.raw`fee (?:was|of)[:\s]+${AMOUNT}\s*${CUR}`, "i"),
  new RegExp(String.raw`charge[:\s]+${AMOUNT}\s*${CUR}`, "i"),
];

// "from JOHN DOE (2507...)" / "to SHOP NAME 12345"
const COUNTERPARTY_PATTERNS = [
  /\bfrom\s+([A-Za-z][A-Za-z .'\-]{1,60}?)\s*(?:\(|\d{3,}|on your|has been|at |\.|,)/i,
  /\bto\s+([A-Za-z][A-Za-z .'\-]{1,60}?)\s*(?:\(|\d{3,}|has been|at |\.|,)/i,
];

function toNumber(raw) {
  if (!raw) return null;
  const n = Number(String(raw).replace(/,/g, ""));
  return Number.isNaN(n) ? null : n;
}

function firstMatch(text, patterns) {
  for (const re of patterns) {
    const m = text.match(re);
    if (m) return m[1];
  }
  return null;
}

// Pulls an ISO-ish date out of the message; falls back to today.
function parseDate(text) {
  const iso = text.match(/(\d{4}-\d{2}-\d{2})/);
  if (iso) return iso[1];

  const dmy = text.match(/(\d{1,2})[/\-](\d{1,2})[/\-](\d{2,4})/);
  if (dmy) {
    const [, d, m, y] = dmy;
    const year = y.length === 2 ? `20${y}` : y;
    return `${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return new Date().toISOString().slice(0, 10);
}

/**
 * @param {string} message raw SMS text
 * @returns {{ok: boolean, reason?: string, data?: object}}
 */
function parseMoMoMessage(message) {
  if (!message || typeof message !== "string" || !message.trim()) {
    return { ok: false, reason: "Empty message." };
  }

  const text = message.replace(/\s+/g, " ").trim();

  let type = null;
  let amount = firstMatch(text, INCOMING_PATTERNS);
  if (amount) {
    type = "income";
  } else {
    amount = firstMatch(text, OUTGOING_PATTERNS);
    if (amount) type = "expense";
  }

  if (!type) {
    return {
      ok: false,
      reason: "Could not tell whether money came in or went out.",
    };
  }

  const value = toNumber(amount);
  if (value === null || value <= 0) {
    return { ok: false, reason: "Could not read a valid amount." };
  }

  let counterparty = firstMatch(text, COUNTERPARTY_PATTERNS);
  // "to your account" / "from your wallet" aren't real counterparties
  if (counterparty && /^your\b/i.test(counterparty.trim())) counterparty = null;

  return {
    ok: true,
    data: {
      type,
      amount: value,
      balance_after: toNumber(firstMatch(text, BALANCE_PATTERNS)),
      fee: toNumber(firstMatch(text, FEE_PATTERNS)),
      external_ref: firstMatch(text, REF_PATTERNS),
      counterparty: counterparty ? counterparty.trim() : null,
      txn_date: parseDate(text),
      raw_message: message,
    },
  };
}

module.exports = { parseMoMoMessage };
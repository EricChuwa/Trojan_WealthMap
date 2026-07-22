const pool = require("../config/db");

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

// GET /api/flow/:month   (month = "YYYY-MM")

const getFlowMonth = async (req, res) => {
  const { month } = req.params;
  const userId = req.user.id; // from the JWT — never trust a user_id from the request

  if (!MONTH_RE.test(month)) {
    return res.status(400).json({
      success: false,
      message: "Month must be in YYYY-MM format.",
    });
  }

  try {
    const budgetResult = await pool.query(
      `SELECT budget_id, month, income, tier_applied,
              needs_alloc, wants_alloc, savings_alloc, created_at
         FROM budgets
        WHERE user_id = $1 AND month = $2`,
      [userId, month],
    );

    const budget = budgetResult.rows[0] || null;
    const budgetId = budget ? budget.budget_id : null;

    // Groups with their items for this month. Items are scoped to the budget,
    // so a group with no items yet still comes back (LEFT JOIN).
    const groupResult = await pool.query(
      `SELECT g.group_id, g.name, g.category, g.is_example,
              i.item_id, i.name AS item_name, i.planned_amount,
              i.is_allocated, i.is_paid, i.sort_order
         FROM expense_groups g
         LEFT JOIN expense_items i
                ON i.group_id = g.group_id
               AND i.budget_id = $2::uuid
        WHERE g.user_id = $1 AND g.is_active = TRUE
        ORDER BY g.category, g.name, i.sort_order, i.created_at`,
      [userId, budgetId],
    );

    const totalsResult = await pool.query(
      `SELECT
         COALESCE(SUM(amount) FILTER (WHERE type = 'income'), 0)  AS money_in,
         COALESCE(SUM(amount) FILTER (WHERE type = 'expense'), 0) AS money_out
         FROM transactions
        WHERE user_id = $1
          AND to_char(txn_date, 'YYYY-MM') = $2`,
      [userId, month],
    );

    // Assemble the flat join into nested groups.
    const groupMap = new Map();
    for (const row of groupResult.rows) {
      if (!groupMap.has(row.group_id)) {
        groupMap.set(row.group_id, {
          group_id: row.group_id,
          name: row.name,
          category: row.category,
          is_example: row.is_example,
          planned: 0,
          spent: 0,
          items: [],
        });
      }
      if (row.item_id) {
        const group = groupMap.get(row.group_id);
        const planned = Number(row.planned_amount);
        group.items.push({
          item_id: row.item_id,
          name: row.item_name,
          planned_amount: planned,
          is_allocated: row.is_allocated,
          is_paid: row.is_paid,
          sort_order: row.sort_order,
        });
        group.planned += planned;
        if (row.is_paid) group.spent += planned;
      }
    }

    const moneyIn = Number(totalsResult.rows[0].money_in);
    const moneyOut = Number(totalsResult.rows[0].money_out);
    const income = budget ? Number(budget.income) : 0;
    const protectedAmount = budget ? Number(budget.savings_alloc) : 0;

    res.status(200).json({
      success: true,
      month,
      budget: budget
        ? {
            budget_id: budget.budget_id,
            income,
            tier_applied: budget.tier_applied,
            needs_alloc: Number(budget.needs_alloc),
            wants_alloc: Number(budget.wants_alloc),
            savings_alloc: protectedAmount,
          }
        : null,
      totals: {
        money_in: moneyIn,
        money_out: moneyOut,
        net: moneyIn - moneyOut,
        protected: protectedAmount,
        // what's genuinely left to spend once savings is fenced off
        spendable: income - protectedAmount - moneyOut,
      },
      groups: Array.from(groupMap.values()),
    });
  } catch (err) {
    console.error("Get flow month error:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

const CATEGORIES = ["need", "want", "saving"];

// POST /api/flow/groups   { name, category }
const createGroup = async (req, res) => {
  const { name, category } = req.body;
  const userId = req.user.id;

  if (!name || !name.trim()) {
    return res
      .status(400)
      .json({ success: false, message: "Group name is required." });
  }
  if (!CATEGORIES.includes(category)) {
    return res.status(400).json({
      success: false,
      message: "Category must be one of: need, want, saving.",
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO expense_groups (user_id, name, category)
       VALUES ($1, $2, $3)
       RETURNING group_id, name, category, is_example, is_active`,
      [userId, name.trim(), category],
    );

    res.status(201).json({
      success: true,
      group: { ...result.rows[0], planned: 0, spent: 0, items: [] },
    });
  } catch (err) {
    // UNIQUE (user_id, name)
    if (err.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "You already have a group with that name.",
      });
    }
    console.error("Create group error:", err);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again." });
  }
};

// PATCH /api/flow/groups/:groupId   { name?, category? }
const updateGroup = async (req, res) => {
  const { groupId } = req.params;
  const { name, category } = req.body;
  const userId = req.user.id;

  if (name !== undefined && !name.trim()) {
    return res
      .status(400)
      .json({ success: false, message: "Group name cannot be empty." });
  }
  if (category !== undefined && !CATEGORIES.includes(category)) {
    return res.status(400).json({
      success: false,
      message: "Category must be one of: need, want, saving.",
    });
  }
  if (name === undefined && category === undefined) {
    return res
      .status(400)
      .json({ success: false, message: "Nothing to update." });
  }

  try {
    // COALESCE keeps the existing value when a field is omitted.
    // The user_id filter is what stops one user editing another's group.
    const result = await pool.query(
      `UPDATE expense_groups
          SET name = COALESCE($3, name),
              category = COALESCE($4, category),
              updated_at = NOW()
        WHERE group_id = $1 AND user_id = $2
        RETURNING group_id, name, category, is_example, is_active`,
      [groupId, userId, name ? name.trim() : null, category || null],
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found." });
    }

    res.status(200).json({ success: true, group: result.rows[0] });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "You already have a group with that name.",
      });
    }
    if (err.code === "22P02") {
      return res
        .status(404)
        .json({ success: false, message: "Group not found." });
    }
    console.error("Update group error:", err);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again." });
  }
};

// DELETE /api/flow/groups/:groupId
const deleteGroup = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `UPDATE expense_groups
          SET is_active = FALSE, updated_at = NOW()
        WHERE group_id = $1 AND user_id = $2 AND is_active = TRUE
        RETURNING group_id`,
      [groupId, userId],
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found." });
    }

    res.status(200).json({ success: true, message: "Group removed." });
  } catch (err) {
    if (err.code === "22P02") {
      return res
        .status(404)
        .json({ success: false, message: "Group not found." });
    }
    console.error("Delete group error:", err);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again." });
  }
};

// Finds the budget for a month, creating an empty one if the user hasn't
const ensureBudget = async (client, userId, month) => {
  const existing = await client.query(
    `SELECT budget_id FROM budgets WHERE user_id = $1 AND month = $2`,
    [userId, month],
  );
  if (existing.rows[0]) return existing.rows[0].budget_id;

  const created = await client.query(
    `INSERT INTO budgets (user_id, month, income, needs_alloc, wants_alloc, savings_alloc)
     VALUES ($1, $2, 0, 0, 0, 0)
     RETURNING budget_id`,
    [userId, month],
  );
  return created.rows[0].budget_id;
};

// POST /api/flow/items   { group_id, month, name, planned_amount? }
const createItem = async (req, res) => {
  const { group_id, month, name, planned_amount } = req.body;
  const userId = req.user.id;

  if (!group_id || !name || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: "group_id and item name are required.",
    });
  }
  if (!MONTH_RE.test(month || "")) {
    return res
      .status(400)
      .json({ success: false, message: "Month must be in YYYY-MM format." });
  }
  const amount = planned_amount === undefined ? 0 : Number(planned_amount);
  if (Number.isNaN(amount) || amount < 0) {
    return res.status(400).json({
      success: false,
      message: "Planned amount must be zero or more.",
    });
  }

  try {
    // Confirm the group belongs to this user before touching anything.
    const owns = await pool.query(
      `SELECT group_id FROM expense_groups
        WHERE group_id = $1 AND user_id = $2 AND is_active = TRUE`,
      [group_id, userId],
    );
    if (owns.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Group not found." });
    }

    const budgetId = await ensureBudget(pool, userId, month);

    const result = await pool.query(
      `INSERT INTO expense_items (group_id, budget_id, name, planned_amount)
       VALUES ($1, $2, $3, $4)
       RETURNING item_id, name, planned_amount, is_allocated, is_paid, sort_order`,
      [group_id, budgetId, name.trim(), amount],
    );

    const item = result.rows[0];
    res.status(201).json({
      success: true,
      item: { ...item, planned_amount: Number(item.planned_amount) },
    });
  } catch (err) {
    if (err.code === "22P02") {
      return res
        .status(404)
        .json({ success: false, message: "Group not found." });
    }
    console.error("Create item error:", err);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again." });
  }
};

// PATCH /api/flow/items/:itemId  { name?, planned_amount?, is_allocated?, is_paid? }
const updateItem = async (req, res) => {
  const { itemId } = req.params;
  const { name, planned_amount, is_allocated, is_paid } = req.body;
  const userId = req.user.id;

  if (name !== undefined && !String(name).trim()) {
    return res
      .status(400)
      .json({ success: false, message: "Item name cannot be empty." });
  }
  let amount = null;
  if (planned_amount !== undefined) {
    amount = Number(planned_amount);
    if (Number.isNaN(amount) || amount < 0) {
      return res.status(400).json({
        success: false,
        message: "Planned amount must be zero or more.",
      });
    }
  }
  if (
    name === undefined &&
    planned_amount === undefined &&
    is_allocated === undefined &&
    is_paid === undefined
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Nothing to update." });
  }

  try {
    // The EXISTS check ties the item back to the signed-in user via its group.
    const result = await pool.query(
      `UPDATE expense_items i
          SET name = COALESCE($3, i.name),
              planned_amount = COALESCE($4, i.planned_amount),
              is_allocated = COALESCE($5, i.is_allocated),
              is_paid = COALESCE($6, i.is_paid),
              updated_at = NOW()
        WHERE i.item_id = $1
          AND EXISTS (
            SELECT 1 FROM expense_groups g
             WHERE g.group_id = i.group_id AND g.user_id = $2
          )
        RETURNING i.item_id, i.name, i.planned_amount, i.is_allocated, i.is_paid, i.sort_order`,
      [
        itemId,
        userId,
        name !== undefined ? String(name).trim() : null,
        amount,
        is_allocated === undefined ? null : Boolean(is_allocated),
        is_paid === undefined ? null : Boolean(is_paid),
      ],
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found." });
    }

    const item = result.rows[0];
    res.status(200).json({
      success: true,
      item: { ...item, planned_amount: Number(item.planned_amount) },
    });
  } catch (err) {
    if (err.code === "22P02") {
      return res.status(404).json({ success: false, message: "Item not found." });
    }
    console.error("Update item error:", err);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again." });
  }
};

// DELETE /api/flow/items/:itemId
// Hard delete — the item was a plan. Any logged transaction survives
// (transactions.item_id is ON DELETE SET NULL), so money history is kept.
const deleteItem = async (req, res) => {
  const { itemId } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      `DELETE FROM expense_items i
        WHERE i.item_id = $1
          AND EXISTS (
            SELECT 1 FROM expense_groups g
             WHERE g.group_id = i.group_id AND g.user_id = $2
          )
        RETURNING i.item_id`,
      [itemId, userId],
    );

    if (result.rowCount === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found." });
    }

    res.status(200).json({ success: true, message: "Item removed." });
  } catch (err) {
    if (err.code === "22P02") {
      return res.status(404).json({ success: false, message: "Item not found." });
    }
    console.error("Delete item error:", err);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again." });
  }
};

// GET /api/flow/:month/transactions
// Flat ledger for the "All Transactions" tab: every income and expense in
// the month, newest first, with the group/item each expense belongs to.
const getTransactions = async (req, res) => {
  const { month } = req.params;
  const userId = req.user.id;

  if (!MONTH_RE.test(month)) {
    return res
      .status(400)
      .json({ success: false, message: "Month must be in YYYY-MM format." });
  }

  try {
    const result = await pool.query(
      `SELECT t.txn_id, t.type, t.amount, t.txn_date, t.source, t.note,
              i.name AS item_name, i.is_allocated, i.is_paid,
              g.name AS group_name, g.category
         FROM transactions t
         LEFT JOIN expense_items i  ON i.item_id  = t.item_id
         LEFT JOIN expense_groups g ON g.group_id = i.group_id
        WHERE t.user_id = $1
          AND to_char(t.txn_date, 'YYYY-MM') = $2
        ORDER BY t.txn_date DESC, t.created_at DESC`,
      [userId, month],
    );

    const transactions = result.rows.map((row) => ({
      txn_id: row.txn_id,
      type: row.type,
      amount: Number(row.amount),
      txn_date: row.txn_date,
      source: row.source,
      note: row.note,
      item_name: row.item_name,
      group_name: row.group_name,
      category: row.category,
      is_allocated: row.is_allocated,
      is_paid: row.is_paid,
    }));

    const moneyIn = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const moneyOut = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    res.status(200).json({
      success: true,
      month,
      totals: { money_in: moneyIn, money_out: moneyOut, net: moneyIn - moneyOut },
      transactions,
    });
  } catch (err) {
    console.error("Get transactions error:", err);
    res
      .status(500)
      .json({ success: false, message: "Something went wrong. Please try again." });
  }
};

module.exports = {
  getFlowMonth,
  getTransactions,
  createGroup,
  updateGroup,
  deleteGroup,
  createItem,
  updateItem,
  deleteItem,
};
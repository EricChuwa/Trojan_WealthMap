-- WealthMap — complete database schema

-- users 
CREATE TABLE users (
  users_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name    VARCHAR(100) NOT NULL,
  last_name     VARCHAR(100) NOT NULL,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone_number  VARCHAR(30),
  country       VARCHAR(100),
  date_of_birth DATE,
  currency      VARCHAR(10),
  role          VARCHAR(20) NOT NULL DEFAULT 'user',
  is_verified   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE user_profiles (
  profile_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL UNIQUE REFERENCES users (users_id) ON DELETE CASCADE,
  avatar_url     VARCHAR(500),
  bio            VARCHAR(500),
  preferred_lang VARCHAR(10) NOT NULL DEFAULT 'en',
  updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE sessions (
  session_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users (users_id) ON DELETE CASCADE,
  refresh_token TEXT NOT NULL,
  expires_at    TIMESTAMP NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- reference 
CREATE TABLE investment_options (
  option_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country         VARCHAR(100),
  name            VARCHAR(150) NOT NULL,
  risk_level      VARCHAR(10) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  min_amount      NUMERIC(14, 2),
  expected_return NUMERIC(5, 2),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE fraud_alerts (
  alert_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  severity    VARCHAR(10) CHECK (severity IN ('info', 'warning', 'critical')),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ================================= FLOW =====================================
-- Budgeting, allocation, and the income/expense ledger.
-- ============================================================================

-- One row per user per month: the income and how it splits.
CREATE TABLE budgets (
  budget_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users (users_id) ON DELETE CASCADE,
  month         VARCHAR(7) NOT NULL,
  income        NUMERIC(14, 2) NOT NULL,
  tier_applied  VARCHAR(50),
  needs_alloc   NUMERIC(14, 2) NOT NULL,
  wants_alloc   NUMERIC(14, 2) NOT NULL,
  savings_alloc NUMERIC(14, 2) NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, month)
);

-- Named recurring groups: "Household expenses", "Weekend trips".
-- category tags the whole group as a need / want / saving.
CREATE TABLE expense_groups (
  group_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users (users_id) ON DELETE CASCADE,
  name       VARCHAR(150) NOT NULL,
  category   VARCHAR(10) NOT NULL CHECK (category IN ('need', 'want', 'saving')),
  is_example BOOLEAN NOT NULL DEFAULT FALSE,
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, name)
);

-- Line items inside a group, scoped to one month's budget.
-- is_allocated = money set aside;  is_paid = money actually spent.
CREATE TABLE expense_items (
  item_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id       UUID NOT NULL REFERENCES expense_groups (group_id) ON DELETE CASCADE,
  budget_id      UUID REFERENCES budgets (budget_id) ON DELETE CASCADE,
  name           VARCHAR(150) NOT NULL,
  planned_amount NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (planned_amount >= 0),
  is_allocated   BOOLEAN NOT NULL DEFAULT FALSE,
  is_paid        BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order     INT NOT NULL DEFAULT 0,
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Unified ledger: every money movement, in or out.
-- Rows created from a mobile-money SMS carry the parsed fields below and
-- start with needs_review = TRUE until the user assigns them to an item.
CREATE TABLE transactions (
  txn_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users (users_id) ON DELETE CASCADE,
  item_id       UUID REFERENCES expense_items (item_id) ON DELETE SET NULL,
  budget_id     UUID REFERENCES budgets (budget_id) ON DELETE SET NULL,
  type          VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  amount        NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  txn_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  source        VARCHAR(50),
  note          VARCHAR(255),
  balance_after NUMERIC(14, 2),
  raw_message   TEXT,
  counterparty  VARCHAR(150),
  external_ref  VARCHAR(100),
  needs_review  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

--  features 
CREATE TABLE goals (
  goal_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users (users_id) ON DELETE CASCADE,
  option_id        UUID REFERENCES investment_options (option_id),
  name             VARCHAR(150) NOT NULL,
  category         VARCHAR(50),
  funded_by        VARCHAR(10) CHECK (funded_by IN ('want', 'saving')),
  target_amount    NUMERIC(14, 2) NOT NULL,
  target_date      DATE,
  monthly_required NUMERIC(14, 2),
  saved_amount     NUMERIC(14, 2) NOT NULL DEFAULT 0,
  status           VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE health_snapshots (
  snapshot_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users (users_id) ON DELETE CASCADE,
  snapshot_date  DATE NOT NULL,
  overall_score  INT,
  budget_score   INT,
  goals_score    INT,
  literacy_score INT,
  activity_score INT,
  streak_days    INT,
  UNIQUE (user_id, snapshot_date)
);

CREATE TABLE activity_log (
  activity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users (users_id) ON DELETE CASCADE,
  event_date  DATE NOT NULL,
  description TEXT,
  category    VARCHAR(50),
  score_delta NUMERIC(6, 2),
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE smell_test_result (
  result_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users (users_id) ON DELETE CASCADE,
  input_text TEXT NOT NULL,
  risk_level VARCHAR(10) CHECK (risk_level IN ('green', 'amber', 'red')),
  summary    TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

--  indexes
CREATE INDEX idx_budgets_user_month    ON budgets (user_id, month);
CREATE INDEX idx_expense_groups_user   ON expense_groups (user_id);
CREATE INDEX idx_expense_items_group   ON expense_items (group_id);
CREATE INDEX idx_expense_items_budget  ON expense_items (budget_id);
CREATE INDEX idx_transactions_user     ON transactions (user_id, txn_date DESC);
CREATE INDEX idx_transactions_budget   ON transactions (budget_id);
CREATE INDEX idx_goals_user            ON goals (user_id, status);
CREATE INDEX idx_health_user_date      ON health_snapshots (user_id, snapshot_date DESC);
CREATE INDEX idx_activity_user_date    ON activity_log (user_id, event_date DESC);

-- Stops a re-sent mobile-money message from double-counting the same payment.
CREATE UNIQUE INDEX idx_txn_external_ref
  ON transactions (user_id, external_ref) WHERE external_ref IS NOT NULL;

-- Powers the "needs categorising" inbox.
CREATE INDEX idx_txn_needs_review
  ON transactions (user_id) WHERE needs_review = TRUE;

-- seed data
-- Rwandan investment options so the roadmap isn't empty on a fresh install.
INSERT INTO investment_options (country, name, risk_level, min_amount, expected_return) VALUES
  ('RW', 'Money Market Fund',     'low',    10000,  10.00),
  ('RW', 'Treasury Bills',        'low',   500000,  12.00),
  ('RW', 'Government Bonds',      'low',   100000,  11.50),
  ('RW', 'Unit Trust Fund',       'medium', 50000,  14.00),
  ('RW', 'Rwanda Stock Exchange', 'high',   25000,  18.00);
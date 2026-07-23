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

-- ================================= LEARN ====================================
-- Course catalogue, lessons, quizzes, skills, and per-user progress.
-- ============================================================================

-- Course catalogue. prerequisite_course_id is self-referencing: a course is
-- locked for a user until they've completed its prerequisite (computed per
-- request, never stored).
CREATE TABLE courses (
  course_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title                  VARCHAR(150) NOT NULL,
  category               VARCHAR(20) NOT NULL
                           CHECK (category IN ('Fundamentals', 'Investing', 'Tax & Strategy')),
  description            TEXT,
  image_url              VARCHAR(500),
  duration_minutes       INT,
  module_number          VARCHAR(20),
  prerequisite_course_id UUID REFERENCES courses (course_id),
  is_active              BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE lessons (
  lesson_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id        UUID NOT NULL REFERENCES courses (course_id) ON DELETE CASCADE,
  title            VARCHAR(200) NOT NULL,
  content          TEXT,
  duration_minutes INT,
  sort_order       INT NOT NULL DEFAULT 0
);

CREATE TABLE quiz_questions (
  question_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id     UUID NOT NULL REFERENCES courses (course_id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  explanation   TEXT,
  sort_order    INT NOT NULL DEFAULT 0
);

CREATE TABLE quiz_options (
  option_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES quiz_questions (question_id) ON DELETE CASCADE,
  option_text VARCHAR(300) NOT NULL,
  is_correct  BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order  INT NOT NULL DEFAULT 0
);

CREATE TABLE skills (
  skill_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(100) NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0
);

-- Many-to-many: a course can count toward more than one skill.
CREATE TABLE course_skills (
  course_id UUID NOT NULL REFERENCES courses (course_id) ON DELETE CASCADE,
  skill_id  UUID NOT NULL REFERENCES skills (skill_id) ON DELETE CASCADE,
  PRIMARY KEY (course_id, skill_id)
);

-- One mutable row per user per lesson — the current position, not a history
-- of every checkpoint reached. progress_percent is a scroll/read checkpoint
-- within the lesson; last_accessed_at drives the "resume last lesson" feature.
CREATE TABLE user_lesson_progress (
  progress_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users (users_id) ON DELETE CASCADE,
  lesson_id        UUID NOT NULL REFERENCES lessons (lesson_id) ON DELETE CASCADE,
  status           VARCHAR(20) NOT NULL DEFAULT 'not_started'
                     CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress_percent INT NOT NULL DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  last_accessed_at TIMESTAMP,
  completed_at     TIMESTAMP,
  UNIQUE (user_id, lesson_id)
);

CREATE TABLE user_quiz_attempts (
  attempt_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL REFERENCES users (users_id) ON DELETE CASCADE,
  question_id        UUID NOT NULL REFERENCES quiz_questions (question_id) ON DELETE CASCADE,
  selected_option_id UUID REFERENCES quiz_options (option_id),
  is_correct         BOOLEAN,
  answered_at        TIMESTAMP NOT NULL DEFAULT NOW()
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

CREATE INDEX idx_lessons_course            ON lessons (course_id, sort_order);
CREATE INDEX idx_quiz_questions_course     ON quiz_questions (course_id, sort_order);
CREATE INDEX idx_quiz_options_question     ON quiz_options (question_id, sort_order);
CREATE INDEX idx_course_skills_skill       ON course_skills (skill_id);
CREATE INDEX idx_user_lesson_progress_user ON user_lesson_progress (user_id, last_accessed_at DESC);
CREATE INDEX idx_user_quiz_attempts_user   ON user_quiz_attempts (user_id, question_id);

-- seed data
-- Rwandan investment options so the roadmap isn't empty on a fresh install.
INSERT INTO investment_options (country, name, risk_level, min_amount, expected_return) VALUES
  ('RW', 'Money Market Fund',     'low',    10000,  10.00),
  ('RW', 'Treasury Bills',        'low',   500000,  12.00),
  ('RW', 'Government Bonds',      'low',   100000,  11.50),
  ('RW', 'Unit Trust Fund',       'medium', 50000,  14.00),
  ('RW', 'Rwanda Stock Exchange', 'high',   25000,  18.00);

-- Learn: course catalogue mirroring the frontend's hardcoded content, so the
-- page isn't empty on a fresh install. The scam-awareness "course" stays out
-- of this table entirely — it's a nav shortcut into fraud_alerts, not real
-- lesson content.
INSERT INTO skills (name, sort_order) VALUES
  ('Money Basics', 1), ('Saving', 2), ('Investing', 3), ('Taxation', 4), ('Real Estate', 5);

INSERT INTO courses (title, category, description, duration_minutes, module_number) VALUES
  ('The Architecture of Wealth', 'Fundamentals',
   'Understanding structural asset allocation and building a financial foundation that withstands market volatility.',
   105, 'Module 1'),
  ('The Psychology of Money', 'Fundamentals',
   'Explore behavioral finance, emotional triggers, and how human behavior shapes long-term financial success.',
   45, NULL),
  ('Strategic Saving', 'Fundamentals',
   'Master budget split models (50/30/20 rule), high-yield saving, and automating your wealth transfers.',
   80, NULL),
  ('Index Funds & ETFs', 'Investing',
   'Demystifying passive investing, low-cost index tracking, diversification, and dollar-cost averaging.',
   135, NULL),
  ('Advanced Tax Strategies', 'Tax & Strategy',
   'Master tax-advantaged accounts, deduction optimization, tax-loss harvesting, and wealth preservation.',
   190, NULL);

-- Advanced Tax Strategies is locked behind Strategic Saving.
UPDATE courses SET prerequisite_course_id = (SELECT course_id FROM courses WHERE title = 'Strategic Saving')
 WHERE title = 'Advanced Tax Strategies';

INSERT INTO lessons (course_id, title, content, duration_minutes, sort_order)
SELECT (SELECT course_id FROM courses WHERE title = 'The Architecture of Wealth'),
       v.title, v.content, v.duration_minutes, v.sort_order
FROM (VALUES
  ('Foundations of Net Worth & Balance Sheets', 'Your net worth is your financial compass. Learn how to calculate assets vs liabilities and structure your primary accounts for cash flow clarity.', 15, 1),
  ('Asset Allocation & Risk Profiling', 'Diversification across asset classes (equities, bonds, real estate, cash) protects against market volatility while capitalizing on long-term compound growth.', 20, 2),
  ('Liquidity vs Illiquidity Reserves', 'Maintaining the optimal balance between accessible emergency liquid reserves and illiquid yield-generating capital.', 18, 3),
  ('Building Emergency Reserves (3-6 Months)', 'Step-by-step framework to calculate true monthly living expenses and fund a high-yield liquid emergency cushion.', 22, 4),
  ('Portfolio Rebalancing Strategies', 'Automating annual or quarterly target rebalancing to lock in gains and maintain your desired risk tolerance.', 15, 5),
  ('Legacy & Generational Wealth Transfer', 'Introduction to estate planning, trusts, and sustainable wealth transfer structures for long-term multi-generational growth.', 15, 6)
) AS v(title, content, duration_minutes, sort_order);

INSERT INTO lessons (course_id, title, content, duration_minutes, sort_order)
SELECT (SELECT course_id FROM courses WHERE title = 'The Psychology of Money'),
       v.title, v.content, v.duration_minutes, v.sort_order
FROM (VALUES
  ('Mindsets of Scarcity vs Abundance', 'Understanding cognitive biases around spending and rewiring your relationship with earned money.', 15, 1),
  ('Overcoming Fear & Greed in Market Cycles', 'Why emotional discipline outperforms market timing in virtually every decade of historical market data.', 15, 2),
  ('The Power of Compounding & Patience', 'Patience is the ultimate financial edge. Small consistent habits compound exponentially over long horizons.', 15, 3)
) AS v(title, content, duration_minutes, sort_order);

INSERT INTO lessons (course_id, title, content, duration_minutes, sort_order)
SELECT (SELECT course_id FROM courses WHERE title = 'Strategic Saving'),
       v.title, v.content, v.duration_minutes, v.sort_order
FROM (VALUES
  ('The 50/30/20 Budgeting Matrix', 'Allocate 50% to essential Needs, 30% to personal Wants, and 20% directly into Savings & Investments.', 15, 1),
  ('Automating Your Payday Wealth Split', 'Remove willpower from saving by setting up instant payday split rules to dedicated sub-accounts.', 15, 2),
  ('High-Yield Savings Accounts vs Inflation', 'How to ensure cash reserves yield competitive interest rates rather than losing purchasing power to inflation.', 18, 3),
  ('Sinking Funds for Major Milestones', 'Create targeted sub-accounts for planned upcoming expenses without depleting primary emergency funds.', 16, 4),
  ('Frugality vs Value-Based Spending', 'Optimize spending by eliminating low-value subscriptions while freely spending on items that bring real utility.', 16, 5)
) AS v(title, content, duration_minutes, sort_order);

INSERT INTO lessons (course_id, title, content, duration_minutes, sort_order)
SELECT (SELECT course_id FROM courses WHERE title = 'Index Funds & ETFs'),
       v.title, v.content, v.duration_minutes, v.sort_order
FROM (VALUES
  ('What is an Index Fund?', 'An index fund buys shares of all companies in a market benchmark, instantly providing broad diversification.', 15, 1),
  ('Expense Ratios & Fee Compression', 'Why paying 0.03% vs 1.5% in fund fees saves hundreds of thousands of dollars over an investing career.', 15, 2),
  ('S&P 500 vs Total Market Index Funds', 'Comparing large-cap concentration with total stock market diversification across market caps.', 20, 3),
  ('Dollar-Cost Averaging (DCA) Mechanics', 'Investing fixed dollar amounts on a regular schedule regardless of short-term market price fluctuations.', 18, 4)
) AS v(title, content, duration_minutes, sort_order);

-- Quiz for Architecture of Wealth
INSERT INTO quiz_questions (course_id, question_text, explanation, sort_order)
VALUES (
  (SELECT course_id FROM courses WHERE title = 'The Architecture of Wealth'),
  'What is the primary purpose of strategic asset allocation in a portfolio?',
  'Asset allocation distributes investments across broad asset classes to optimize risk-adjusted returns according to individual timelines and tolerance.',
  1
);
INSERT INTO quiz_options (question_id, option_text, is_correct, sort_order)
SELECT (SELECT question_id FROM quiz_questions
         WHERE course_id = (SELECT course_id FROM courses WHERE title = 'The Architecture of Wealth')),
       v.option_text, v.is_correct, v.sort_order
FROM (VALUES
  ('To maximize short-term speculative trading profits', FALSE, 1),
  ('To balance risk and return based on goals, timeline, and risk tolerance', TRUE, 2),
  ('To avoid paying taxes completely on earned income', FALSE, 3),
  ('To hold 100% of wealth in high-volatility cryptocurrencies', FALSE, 4)
) AS v(option_text, is_correct, sort_order);

-- Quiz for Psychology of Money
INSERT INTO quiz_questions (course_id, question_text, explanation, sort_order)
VALUES (
  (SELECT course_id FROM courses WHERE title = 'The Psychology of Money'),
  'Which behavioral tendency is most damaging to long-term investor returns?',
  'Panic selling during market declines converts paper losses into permanent capital losses and misses key recovery periods.',
  1
);
INSERT INTO quiz_options (question_id, option_text, is_correct, sort_order)
SELECT (SELECT question_id FROM quiz_questions
         WHERE course_id = (SELECT course_id FROM courses WHERE title = 'The Psychology of Money')),
       v.option_text, v.is_correct, v.sort_order
FROM (VALUES
  ('Buying index funds during market dips', FALSE, 1),
  ('Panic selling at market bottoms due to fear', TRUE, 2),
  ('Automating monthly savings transfers', FALSE, 3),
  ('Maintaining a 6-month liquid emergency fund', FALSE, 4)
) AS v(option_text, is_correct, sort_order);

-- Skill tagging (a course can count toward more than one skill).
INSERT INTO course_skills (course_id, skill_id)
SELECT c.course_id, s.skill_id FROM courses c, skills s
WHERE (c.title = 'The Architecture of Wealth' AND s.name = 'Money Basics')
   OR (c.title = 'The Psychology of Money'    AND s.name = 'Money Basics')
   OR (c.title = 'Strategic Saving'           AND s.name IN ('Saving', 'Money Basics'))
   OR (c.title = 'Index Funds & ETFs'         AND s.name = 'Investing')
   OR (c.title = 'Advanced Tax Strategies'    AND s.name = 'Taxation');
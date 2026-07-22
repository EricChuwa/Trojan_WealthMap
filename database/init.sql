-- WealthMap schema — generated from the team's ERD.
-- Runs automatically on first container start (mounted into /docker-entrypoint-initdb.d/).

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

CREATE TABLE investment_options (
  option_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country         VARCHAR(100),
  name            VARCHAR(150) NOT NULL,
  risk_level      VARCHAR(10) NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  min_amount      NUMERIC(14, 2),
  expected_return NUMERIC(5, 2),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE
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

CREATE TABLE income_entries (
  income_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users (users_id) ON DELETE CASCADE,
  amount      NUMERIC(14, 2) NOT NULL,
  received_on DATE NOT NULL,
  source      VARCHAR(50),
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE budgets (
  budget_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users (users_id) ON DELETE CASCADE,
  month         VARCHAR(7) NOT NULL,
  income        NUMERIC(14, 2) NOT NULL,
  tier_applied  VARCHAR(50),
  needs_alloc   NUMERIC(14, 2) NOT NULL,
  wants_alloc   NUMERIC(14, 2) NOT NULL,
  savings_alloc NUMERIC(14, 2) NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE goals (
  goal_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES users (users_id) ON DELETE CASCADE,
  option_id        UUID REFERENCES investment_options (option_id),
  name             VARCHAR(150) NOT NULL,
  category         VARCHAR(50),
  target_amount    NUMERIC(14, 2) NOT NULL,
  target_date      DATE,
  monthly_required NUMERIC(14, 2),
  saved_amount     NUMERIC(14, 2) NOT NULL DEFAULT 0,
  status           VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned'))
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
  streak_days    INT
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

CREATE TABLE fraud_alerts (
  alert_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  severity    VARCHAR(10) CHECK (severity IN ('info', 'warning', 'critical')),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

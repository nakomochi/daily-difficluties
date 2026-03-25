CREATE TABLE IF NOT EXISTS stages (
    id         SERIAL PRIMARY KEY,
    name       TEXT NOT NULL DEFAULT '',
    data       JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_stages (
    date       DATE PRIMARY KEY,
    stage_id   INTEGER NOT NULL REFERENCES stages(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_stages_stage_id ON daily_stages(stage_id);

-- name: CreateStage :one
INSERT INTO stages (name, data) VALUES ($1, $2) RETURNING *;

-- name: GetStage :one
SELECT * FROM stages WHERE id = $1;

-- name: ListStages :many
SELECT id, name, created_at, updated_at FROM stages ORDER BY id;

-- name: UpdateStage :one
UPDATE stages SET name = $2, data = $3, updated_at = NOW() WHERE id = $1 RETURNING *;

-- name: DeleteStage :exec
DELETE FROM stages WHERE id = $1;

-- name: GetTodayStage :one
SELECT s.* FROM stages s
JOIN daily_stages ds ON ds.stage_id = s.id
WHERE ds.date = CURRENT_DATE;

-- name: GetStageByDate :one
SELECT s.* FROM stages s
JOIN daily_stages ds ON ds.stage_id = s.id
WHERE ds.date = $1;

-- name: AssignStageToDate :exec
INSERT INTO daily_stages (date, stage_id) VALUES ($1, $2)
ON CONFLICT (date) DO UPDATE SET stage_id = EXCLUDED.stage_id;

-- name: UnassignDate :exec
DELETE FROM daily_stages WHERE date = $1;

-- name: ListSchedule :many
SELECT ds.date, ds.stage_id, s.name
FROM daily_stages ds
JOIN stages s ON s.id = ds.stage_id
ORDER BY ds.date;

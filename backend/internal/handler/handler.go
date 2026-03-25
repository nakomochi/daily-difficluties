package handler

import (
	"crypto/subtle"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/jackc/pgx/v5/pgtype"

	"web-go-template/internal/db"
)

const (
	gridRows = 19
	gridCols = 25
	maxTile  = 8
)

type Handler struct {
	queries *db.Queries
}

func New(queries *db.Queries) *Handler {
	return &Handler{queries: queries}
}

func AdminOnly(apiKey string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if subtle.ConstantTimeCompare([]byte(r.Header.Get("X-API-Key")), []byte(apiKey)) != 1 {
				http.Error(w, "forbidden", http.StatusForbidden)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

func (h *Handler) GetTodayStage(w http.ResponseWriter, r *http.Request) {
	stage, err := h.queries.GetTodayStage(r.Context())
	if err != nil {
		http.Error(w, "no stage set for today", http.StatusNotFound)
		return
	}
	writeStageJSON(w, http.StatusOK, stage)
}

func (h *Handler) ListStages(w http.ResponseWriter, r *http.Request) {
	stages, err := h.queries.ListStages(r.Context())
	if err != nil {
		http.Error(w, "failed to list stages", http.StatusInternalServerError)
		return
	}
	if stages == nil {
		stages = []db.ListStagesRow{}
	}
	writeJSON(w, http.StatusOK, stages)
}

func (h *Handler) GetStage(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}
	stage, err := h.queries.GetStage(r.Context(), id)
	if err != nil {
		http.Error(w, "stage not found", http.StatusNotFound)
		return
	}
	writeStageJSON(w, http.StatusOK, stage)
}

type stageRequest struct {
	Name string      `json:"name"`
	Data [][]float64 `json:"data"`
}

func (h *Handler) CreateStage(w http.ResponseWriter, r *http.Request) {
	var req stageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}
	if err := validateStageData(req.Data); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	dataJSON, _ := json.Marshal(req.Data)
	stage, err := h.queries.CreateStage(r.Context(), db.CreateStageParams{
		Name: req.Name,
		Data: dataJSON,
	})
	if err != nil {
		http.Error(w, "failed to create stage", http.StatusInternalServerError)
		return
	}
	writeStageJSON(w, http.StatusCreated, stage)
}

func (h *Handler) UpdateStage(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}
	var req stageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}
	if err := validateStageData(req.Data); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	dataJSON, _ := json.Marshal(req.Data)
	stage, err := h.queries.UpdateStage(r.Context(), db.UpdateStageParams{
		ID:   id,
		Name: req.Name,
		Data: dataJSON,
	})
	if err != nil {
		http.Error(w, "stage not found", http.StatusNotFound)
		return
	}
	writeStageJSON(w, http.StatusOK, stage)
}

func (h *Handler) DeleteStage(w http.ResponseWriter, r *http.Request) {
	id, err := parseID(r)
	if err != nil {
		http.Error(w, "invalid id", http.StatusBadRequest)
		return
	}
	if err := h.queries.DeleteStage(r.Context(), id); err != nil {
		http.Error(w, "failed to delete stage (may be referenced by schedule)", http.StatusConflict)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) AssignStageToDate(w http.ResponseWriter, r *http.Request) {
	date, err := parseDate(r)
	if err != nil {
		http.Error(w, "invalid date format (use YYYY-MM-DD)", http.StatusBadRequest)
		return
	}
	var req struct {
		StageID int32 `json:"stage_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.StageID <= 0 {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}
	if err := h.queries.AssignStageToDate(r.Context(), db.AssignStageToDateParams{
		Date:    date,
		StageID: req.StageID,
	}); err != nil {
		http.Error(w, "failed to assign stage", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) UnassignDate(w http.ResponseWriter, r *http.Request) {
	date, err := parseDate(r)
	if err != nil {
		http.Error(w, "invalid date format (use YYYY-MM-DD)", http.StatusBadRequest)
		return
	}
	if err := h.queries.UnassignDate(r.Context(), date); err != nil {
		http.Error(w, "failed to unassign date", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) ListSchedule(w http.ResponseWriter, r *http.Request) {
	schedule, err := h.queries.ListSchedule(r.Context())
	if err != nil {
		http.Error(w, "failed to list schedule", http.StatusInternalServerError)
		return
	}
	if schedule == nil {
		schedule = []db.ListScheduleRow{}
	}

	type scheduleEntry struct {
		Date    string `json:"date"`
		StageID int32  `json:"stage_id"`
		Name    string `json:"name"`
	}
	entries := make([]scheduleEntry, len(schedule))
	for i, s := range schedule {
		entries[i] = scheduleEntry{
			Date:    s.Date.Time.Format("2006-01-02"),
			StageID: s.StageID,
			Name:    s.Name,
		}
	}
	writeJSON(w, http.StatusOK, entries)
}

func parseID(r *http.Request) (int32, error) {
	n, err := strconv.Atoi(chi.URLParam(r, "id"))
	if err != nil {
		return 0, err
	}
	return int32(n), nil
}

func parseDate(r *http.Request) (pgtype.Date, error) {
	s := chi.URLParam(r, "date")
	t, err := time.Parse("2006-01-02", s)
	if err != nil {
		return pgtype.Date{}, err
	}
	return pgtype.Date{Time: t, Valid: true}, nil
}

func validateStageData(data [][]float64) error {
	if len(data) != gridRows {
		return fmt.Errorf("data must have %d rows, got %d", gridRows, len(data))
	}
	for i, row := range data {
		if len(row) != gridCols {
			return fmt.Errorf("row %d must have %d cols, got %d", i, gridCols, len(row))
		}
		for _, v := range row {
			iv := int(v)
			if float64(iv) != v || iv < 0 || iv > maxTile {
				return fmt.Errorf("tile values must be integers 0-%d", maxTile)
			}
		}
	}
	return nil
}

type stageResponse struct {
	ID   int32           `json:"id"`
	Name string          `json:"name"`
	Data json.RawMessage `json:"data"`
}

func writeStageJSON(w http.ResponseWriter, status int, s db.Stage) {
	writeJSON(w, status, stageResponse{
		ID:   s.ID,
		Name: s.Name,
		Data: s.Data,
	})
}

func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(data)
}


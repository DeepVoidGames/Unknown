package handlers

import (
	"backend/database"
	"backend/game"
	"backend/models"
	"backend/security"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

type SaveRequest struct {
	ID        string          `json:"id"`
	Nickname  string          `json:"nickname"`
	GameState json.RawMessage `json:"game_state"`
	Signature string          `json:"signature"`
}

type GenericResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message,omitempty"`
	Data    any    `json:"data,omitempty"`
}

func SaveHandler(w http.ResponseWriter, r *http.Request) {
	var req SaveRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if !security.VerifyHMAC(req.GameState, req.Signature) {
		respondWithError(w, http.StatusForbidden, "Invalid signature")
		return
	}

	var newState models.GameState
	if err := json.Unmarshal(req.GameState, &newState); err != nil {
		respondWithError(w, http.StatusBadRequest, "Invalid game state format")
		return
	}

	var oldState *models.GameState
	var lastUpdate time.Time
	
	_, oldStateJSON, dbUpdatedAt, err := database.GetPlayer(req.ID)
	if err == nil {
		oldState, _ = models.FromJSON(oldStateJSON)
		lastUpdate = dbUpdatedAt
		
		if security.IsThrottled(lastUpdate) {
			respondWithError(w, http.StatusTooManyRequests, "Please wait 60 seconds between saves")
			return
		}
	} else if err != sql.ErrNoRows {
		log.Printf("DB error: %v", err)
	}

	if err := game.ValidateProgress(oldState, &newState, lastUpdate); err != nil {
		respondWithError(w, http.StatusForbidden, fmt.Sprintf("Anti-cheat: %v", err))
		return
	}

	if err := database.SavePlayer(req.ID, req.Nickname, req.GameState); err != nil {
		log.Printf("Save error: %v", err)
		respondWithError(w, http.StatusInternalServerError, "Failed to save data")
		return
	}

	respondWithJSON(w, http.StatusOK, GenericResponse{Success: true, Message: "Game saved successfully"})
}

func LoadHandler(w http.ResponseWriter, r *http.Request) {
	id := r.URL.Query().Get("id")
	if id == "" {
		respondWithError(w, http.StatusBadRequest, "ID is required")
		return
	}

	_, stateJSON, _, err := database.GetPlayer(id)
	if err == sql.ErrNoRows {
		respondWithError(w, http.StatusNotFound, "Player not found")
		return
	} else if err != nil {
		log.Printf("Load error: %v", err)
		respondWithError(w, http.StatusInternalServerError, "Failed to load data")
		return
	}

	respondWithJSON(w, http.StatusOK, GenericResponse{Success: true, Data: json.RawMessage(stateJSON)})
}

func LeaderboardHandler(w http.ResponseWriter, r *http.Request) {
	category := r.URL.Query().Get("category")
	if category == "" {
		category = "seeds"
	}

	entries, err := database.GetLeaderboard(category, 100)
	if err != nil {
		log.Printf("Leaderboard error: %v", err)
		respondWithError(w, http.StatusInternalServerError, "Failed to fetch leaderboard")
		return
	}

	respondWithJSON(w, http.StatusOK, GenericResponse{Success: true, Data: entries})
}

func respondWithError(w http.ResponseWriter, code int, message string) {
	respondWithJSON(w, code, GenericResponse{Success: false, Message: message})
}

func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	response, _ := json.Marshal(payload)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	w.Write(response)
}

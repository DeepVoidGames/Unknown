package database

import (
	"database/sql"
	_ "modernc.org/sqlite"
	"log"
	"time"
)

var DB *sql.DB

func InitDB(dbPath string) (*sql.DB, error) {
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		return nil, err
	}

	// Enable WAL mode for performance
	if _, err := db.Exec("PRAGMA journal_mode=WAL;"); err != nil {
		log.Printf("failed to enable WAL: %v", err)
	}

	// Create tables
	schema := `
	CREATE TABLE IF NOT EXISTS players (
		id TEXT PRIMARY KEY,
		nickname TEXT DEFAULT 'Rick',
		game_state BLOB,
		seeds INTEGER GENERATED ALWAYS AS (json_extract(game_state, '$.seeds')) VIRTUAL,
		max_dimension INTEGER GENERATED ALWAYS AS (json_extract(game_state, '$.maxDimensionLevel')) VIRTUAL,
		inventory_count INTEGER GENERATED ALWAYS AS (json_array_length(json_extract(game_state, '$.inventory'))) VIRTUAL,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);
	
	CREATE INDEX IF NOT EXISTS idx_players_seeds ON players(seeds);
	CREATE INDEX IF NOT EXISTS idx_players_max_dimension ON players(max_dimension);
	CREATE INDEX IF NOT EXISTS idx_players_inventory_count ON players(inventory_count);
	`
	_, err = db.Exec(schema)
	if err != nil {
		return nil, err
	}

	DB = db
	return db, nil
}

func SavePlayer(id string, nickname string, gameStateJSON []byte) error {
	_, err := DB.Exec(`
		INSERT INTO players (id, nickname, game_state, updated_at) 
		VALUES (?, ?, jsonb(?), CURRENT_TIMESTAMP)
		ON CONFLICT(id) DO UPDATE SET 
			nickname=?,
			game_state=jsonb(?), 
			updated_at=CURRENT_TIMESTAMP
	`, id, nickname, gameStateJSON, nickname, gameStateJSON)
	return err
}

func GetPlayer(id string) (string, []byte, time.Time, error) {
	var playerId string
	var gameState []byte
	var updatedAt time.Time
	err := DB.QueryRow("SELECT id, json(game_state), updated_at FROM players WHERE id = ?", id).Scan(&playerId, &gameState, &updatedAt)
	if err != nil {
		return "", nil, time.Time{}, err
	}
	return playerId, gameState, updatedAt, nil
}

type LeaderboardEntry struct {
	ID       string `json:"id"`
	Nickname string `json:"nickname"`
	Value    int64  `json:"value"`
}

func GetLeaderboard(category string, limit int) ([]LeaderboardEntry, error) {
	var query string
	switch category {
	case "seeds":
		query = "SELECT id, nickname, seeds FROM players ORDER BY seeds DESC LIMIT ?"
	case "dimension":
		query = "SELECT id, nickname, max_dimension FROM players ORDER BY max_dimension DESC LIMIT ?"
	case "inventory":
		query = "SELECT id, nickname, inventory_count FROM players ORDER BY inventory_count DESC LIMIT ?"
	case "discovery":
		query = `
			SELECT id, nickname, (SELECT count(*) FROM json_each(json_extract(game_state, '$.discoveredCards'))) as discovery_count 
			FROM players 
			ORDER BY discovery_count DESC 
			LIMIT ?`
	default:
		query = "SELECT id, nickname, seeds FROM players ORDER BY seeds DESC LIMIT ?"
	}

	rows, err := DB.Query(query, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var entries []LeaderboardEntry
	for rows.Next() {
		var e LeaderboardEntry
		if err := rows.Scan(&e.ID, &e.Nickname, &e.Value); err != nil {
			return nil, err
		}
		entries = append(entries, e)
	}
	return entries, nil
}

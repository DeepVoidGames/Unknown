package models

import (
	"encoding/json"
)

type GameCard struct {
	ID          string   `json:"id"`
	CharacterID int      `json:"characterId"`
	Types       []string `json:"types"`
}

type GameState struct {
	Seeds             int64              `json:"seeds"`
	Inventory         []GameCard         `json:"inventory"`
	DiscoveredCards   map[string][]string `json:"discoveredCards"` // map[characterId]types
	DimensionLevel    int                `json:"dimensionLevel"`
	MaxDimensionLevel int                `json:"maxDimensionLevel"`
	LastSaved         int64              `json:"lastSaved"` // JS timestamp
}

func (gs *GameState) ToJSON() ([]byte, error) {
	return json.Marshal(gs)
}

func FromJSON(data []byte) (*GameState, error) {
	var gs GameState
	err := json.Unmarshal(data, &gs)
	return &gs, err
}

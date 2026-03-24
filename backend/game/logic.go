package game

import (
	"backend/models"
	"fmt"
	"time"
)

// Constants for logical verification
const (
	MaxSeedsPerSecond   = 500.0 // Adjusted for "Seeds"
	MaxNewCardsPerSave  = 200
)

func ValidateProgress(oldState *models.GameState, newState *models.GameState, lastUpdate time.Time) error {
	// If no old state, it's a new player.
	if oldState == nil {
		return nil
	}

	deltaSeconds := time.Since(lastUpdate).Seconds()
	if deltaSeconds < 0 {
		return fmt.Errorf("invalid time delta")
	}

	// 1. Seeds Verification
	seedsDiff := newState.Seeds - oldState.Seeds
	if seedsDiff > 0 {
		// Calculate max possible based on some game logic
		maxPossibleSeeds := (MaxSeedsPerSecond * deltaSeconds) + float64(newState.MaxDimensionLevel*1000)
		if float64(seedsDiff) > maxPossibleSeeds {
			return fmt.Errorf("impossible seeds gain: %d in %.1fs", seedsDiff, deltaSeconds)
		}
	}

	// 2. Inventory Count Verification
	inventoryDiff := len(newState.Inventory) - len(oldState.Inventory)
	if inventoryDiff > MaxNewCardsPerSave {
		return fmt.Errorf("impossible inventory growth: %d", inventoryDiff)
	}

	// 3. Dimension Level check
	if newState.MaxDimensionLevel < oldState.MaxDimensionLevel {
		return fmt.Errorf("max dimension level cannot decrease")
	}

	return nil
}

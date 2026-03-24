package security

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"os"
	"time"
)

var SecretKey = getSecretKey()

func getSecretKey() []byte {
	key := os.Getenv("GAME_SECRET")
	if key == "" {
		return []byte("love-u-rick-<3")
	}
	return []byte(key)
}

func VerifyHMAC(message []byte, signature string) bool {
	h := hmac.New(sha256.New, SecretKey)
	h.Write(message)
	expectedSignature := hex.EncodeToString(h.Sum(nil))
	return hmac.Equal([]byte(expectedSignature), []byte(signature))
}

func IsThrottled(lastUpdate time.Time) bool {
	return time.Since(lastUpdate) < 60*time.Second
}

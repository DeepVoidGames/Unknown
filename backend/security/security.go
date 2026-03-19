package security

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"time"
)

var SecretKey = []byte("morty-secret-key-change-me")

func VerifyHMAC(message []byte, signature string) bool {
	h := hmac.New(sha256.New, SecretKey)
	h.Write(message)
	expectedSignature := hex.EncodeToString(h.Sum(nil))
	return hmac.Equal([]byte(expectedSignature), []byte(signature))
}

func IsThrottled(lastUpdate time.Time) bool {
	return time.Since(lastUpdate) < 60*time.Second
}

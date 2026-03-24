package main

import (
	"backend/database"
	"backend/handlers"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func main() {
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "game.db"
	}

	db, err := database.InitDB(dbPath)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer db.Close()

	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Content-Type", "X-HMAC-Signature"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Routes
	r.Route("/api", func(r chi.Router) {
		r.Post("/save", handlers.SaveHandler)
		r.Get("/load", handlers.LoadHandler)
		r.Get("/leaderboard", handlers.LeaderboardHandler)
		r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
			w.Write([]byte("Wubba lubba dub dub! Server is running."))
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Rick's Server starting on port %s...\n", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}

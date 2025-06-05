package main

import (
	"log"
	"strconv"
	"fmt"
	"net/http"

	"github.com/lolzone13/DeepResearch/internal/config"
)

func main() {

	cfg, err := config.LoadConfig("dev")

	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	addr := cfg.Server.Host + ":" + strconv.Itoa(cfg.Server.Port)
	
	// Register routes
	http.HandleFunc("/", homeHandler)
	http.HandleFunc("/health", healthHandler)

	// Listen on server
	log.Printf("Starting server on %s", addr)
	if err := http.ListenAndServe(addr, nil); err != nil {
		log.Fatalf("Failed to start server")
	}
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/plain")
	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, "Welcome to the DeepResearch API")
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprintln(w, `{"status": "healthy"}`)
}
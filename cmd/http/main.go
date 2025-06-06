package main

import (
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

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
	http.HandleFunc("/research", researchStreamHandler)

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

func researchStreamHandler(w http.ResponseWriter, r *http.Request) {
	// Set CORS headers first
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

	// Handle preflight requests
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	// Set SSE headers
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")

	// Simulate research progress
	steps := []string{
		"Starting research...",
		"Finding relevant sources...",
		"Found 3 academic papers",
		"Found 5 news articles",
		"Processing documents...",
		"Generating summary...",
		"Research complete!",
	}

	for i, step := range steps {
		progress := int((float64(i+1) / float64(len(steps))) * 100)
		fmt.Fprintf(w, "data: {\"step\": \"%s\", \"progress\": %d, \"timestamp\": \"%s\"}\n\n",
			step, progress, time.Now().Format(time.RFC3339))

		if flusher, ok := w.(http.Flusher); ok {
			flusher.Flush()
		}

		time.Sleep(1 * time.Second)
	}
}

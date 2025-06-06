package main

import (
	"log"
	"strconv"

	_ "github.com/lolzone13/DeepResearch/docs" // Import swagger docs
	"github.com/lolzone13/DeepResearch/internal/config"
	"github.com/lolzone13/DeepResearch/internal/handlers"
	"github.com/lolzone13/DeepResearch/internal/services"
)

// @title DeepResearch API
// @version 1.0.0
// @description AI-powered research platform API
// @termsOfService http://swagger.io/terms/

// @contact.name DeepResearch Team
// @contact.url http://www.deepresearch.ai
// @contact.email contact@deepresearch.ai

// @license.name MIT
// @license.url http://opensource.org/licenses/MIT

// @host localhost:8080
// @BasePath /

// @securityDefinitions.apikey ApiKeyAuth
// @in header
// @name Authorization
// @description Bearer token for API authentication (e.g., "Bearer {token}")

func main() {
	cfg, err := config.LoadConfig("dev")
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	// Initialize database service
	dbService, err := services.NewDatabaseService(cfg)
	if err != nil {
		log.Printf("Failed to connect to database: %v", err)
		log.Printf("Starting server without database connection...")
		
		// Fallback to routes without database (you could create a mock setup)
		// For now, we'll exit since we need database for the service-based setup
		log.Fatalf("Database connection required for service-based API")
	}
	defer dbService.Close()

	addr := cfg.Server.Host + ":" + strconv.Itoa(cfg.Server.Port)

	// Setup routes with services
	router, err := handlers.SetupRoutesWithServices(cfg, dbService)
	if err != nil {
		log.Fatalf("Failed to setup routes: %v", err)
	}

	// Start server
	log.Printf("Starting server on %s", addr)
	log.Printf("Swagger docs available at: http://%s/swagger/index.html", addr)

	if err := router.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

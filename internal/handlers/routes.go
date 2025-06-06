package handlers

import (
	"github.com/gin-gonic/gin"
	"github.com/lolzone13/DeepResearch/internal/config"
	"github.com/lolzone13/DeepResearch/internal/middleware"
	"github.com/lolzone13/DeepResearch/internal/services"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// SetupRoutesWithServices configures and registers all HTTP routes with dependency injection
func SetupRoutesWithServices(cfg *config.Config, dbService *services.DatabaseService) (*gin.Engine, error) {
	// Set Gin mode (can be set via environment variable)
	gin.SetMode(gin.ReleaseMode)

	router := gin.Default()

	// Create services
	authService := services.NewAuthService(dbService.GetDB(), cfg.JWT.Secret, cfg.JWT.ExpiryHours)
	sessionService := services.NewSessionService(dbService.GetDB())

	// Create handlers
	authHandlers := NewAuthHandlers(authService)
	sessionHandlers := NewSessionHandlers(sessionService)

	// Add CORS middleware
	router.Use(middleware.CORSMiddleware())

	// Swagger documentation
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// General routes
	router.GET("/", HomeHandler)
	router.GET("/health", HealthHandler)

	// Auth routes (no auth required)
	auth := router.Group("/auth")
	{
		auth.POST("/login", authHandlers.Login)
		auth.POST("/register", authHandlers.Register)
	}

	// Research routes (auth required)
	research := router.Group("/research")
	research.Use(middleware.AuthMiddleware(authService))
	{
		research.GET("/stream", ResearchStreamHandler)

		// Session management routes
		sessions := research.Group("/sessions")
		{
			sessions.POST("/", sessionHandlers.CreateSession)
			sessions.GET("/", sessionHandlers.ListSessions)
			sessions.GET("/:id", sessionHandlers.GetSession)
			sessions.PUT("/:id", sessionHandlers.UpdateSession)
			sessions.DELETE("/:id", sessionHandlers.DeleteSession)
		}
	}

	return router, nil
}

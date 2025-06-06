package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/lolzone13/DeepResearch/internal/models"
)

// @Summary Health check
// @Description Check if the API is healthy and running
// @Tags health
// @Produce json
// @Success 200 {object} models.HealthResponse "API is healthy"
// @Router /health [get]
func HealthHandler(c *gin.Context) {
	response := models.HealthResponse{
		Status:    "healthy",
		Timestamp: time.Now().Format(time.RFC3339),
		Version:   "1.0.0",
	}
	c.JSON(http.StatusOK, response)
}

// @Summary Welcome message
// @Description Get welcome message for the API
// @Tags general
// @Produce json
// @Success 200 {object} map[string]string "Welcome message"
// @Router / [get]
func HomeHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"message": "Welcome to the DeepResearch API",
		"version": "1.0.0",
		"docs":    "/swagger/index.html",
	})
}

package handlers

import (
	"fmt"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/lolzone13/DeepResearch/internal/models"
)

// @Summary Research streaming
// @Description Stream research progress in real-time using Server-Sent Events
// @Tags research
// @Produce text/event-stream
// @Security ApiKeyAuth
// @Param query query string true "Research query"
// @Success 200 {object} models.ResearchProgressEvent "Research progress stream"
// @Failure 400 {object} models.ErrorResponse "Invalid request"
// @Failure 401 {object} models.ErrorResponse "Unauthorized"
// @Router /research/stream [get]
func ResearchStreamHandler(c *gin.Context) {
	query := c.Query("query")
	if query == "" {
		c.JSON(400, models.ErrorResponse{
			Error:   "Invalid request",
			Code:    400,
			Message: "Query parameter is required",
		})
		return
	}

	// Set SSE headers
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("Access-Control-Allow-Origin", "*")

	// Simulate research progress
	steps := []models.ResearchProgressEvent{
		{Step: "Starting research...", Progress: 0, Status: "processing"},
		{Step: "Finding relevant sources...", Progress: 20, Status: "processing"},
		{Step: "Found 3 academic papers", Progress: 40, Sources: 3, Status: "processing"},
		{Step: "Found 5 news articles", Progress: 60, Sources: 8, Status: "processing"},
		{Step: "Processing documents...", Progress: 80, Sources: 8, Status: "processing"},
		{Step: "Generating summary...", Progress: 90, Sources: 8, Status: "processing"},
		{Step: "Research complete!", Progress: 100, Sources: 8, Status: "completed"},
	}

	w := c.Writer
	for _, step := range steps {
		step.Timestamp = time.Now().Format(time.RFC3339)

		fmt.Fprintf(w, "data: {\"step\": \"%s\", \"progress\": %d, \"timestamp\": \"%s\", \"sources\": %d, \"status\": \"%s\"}\n\n",
			step.Step, step.Progress, step.Timestamp, step.Sources, step.Status)

		if f, ok := w.(gin.ResponseWriter); ok {
			f.Flush()
		}

		time.Sleep(1 * time.Second)
	}
}

package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/lolzone13/DeepResearch/internal/middleware"
	"github.com/lolzone13/DeepResearch/internal/models"
	"github.com/lolzone13/DeepResearch/internal/services"
)

// SessionHandlers holds the session service dependency
type SessionHandlers struct {
	sessionService *services.SessionService
}

// NewSessionHandlers creates new session handlers
func NewSessionHandlers(sessionService *services.SessionService) *SessionHandlers {
	return &SessionHandlers{
		sessionService: sessionService,
	}
}

// Helper function to parse tags from JSON string
func parseTags(tagsJSON string) []string {
	var tags []string
	if tagsJSON == "" {
		return tags
	}
	json.Unmarshal([]byte(tagsJSON), &tags)
	return tags
}

// @Summary Create research session
// @Description Create a new research session
// @Tags research
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param request body models.CreateSessionRequest true "Session details"
// @Success 201 {object} models.SessionResponse "Session created successfully"
// @Failure 400 {object} models.ErrorResponse "Invalid request"
// @Failure 401 {object} models.ErrorResponse "Unauthorized"
// @Router /research/sessions [post]
func (h *SessionHandlers) CreateSession(c *gin.Context) {
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "Unauthorized",
			Code:    401,
			Message: "User not found in context",
		})
		return
	}

	var req models.CreateSessionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "Invalid request",
			Code:    400,
			Message: err.Error(),
		})
		return
	}

	// Create session using service
	session, err := h.sessionService.CreateSession(userID, req.Title, req.Query, req.Tags)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "Failed to create session",
			Code:    500,
			Message: err.Error(),
		})
		return
	}

	// Convert to API response
	response := models.SessionResponse{
		ID:           session.ID.String(),
		UserID:       session.UserID.String(),
		Title:        session.Title,
		Query:        session.Query,
		Status:       "pending", // Default status since model doesn't have it
		MessageCount: len(session.Messages),
		CreatedAt:    session.CreatedAt,
		UpdatedAt:    session.UpdatedAt,
		Tags:         parseTags(session.Tags),
	}

	c.JSON(http.StatusCreated, response)
}

// @Summary List research sessions
// @Description Get a paginated list of research sessions for the authenticated user
// @Tags research
// @Produce json
// @Security ApiKeyAuth
// @Param page query int false "Page number" default(1)
// @Param per_page query int false "Items per page" default(10)
// @Param status query string false "Filter by status"
// @Success 200 {object} models.SessionsListResponse "List of sessions"
// @Failure 401 {object} models.ErrorResponse "Unauthorized"
// @Router /research/sessions [get]
func (h *SessionHandlers) ListSessions(c *gin.Context) {
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "Unauthorized",
			Code:    401,
			Message: "User not found in context",
		})
		return
	}

	// Parse pagination parameters
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	perPage, _ := strconv.Atoi(c.DefaultQuery("per_page", "10"))
	status := c.Query("status")

	// Get sessions from service
	sessions, total, err := h.sessionService.ListSessions(userID, page, perPage, status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "Failed to fetch sessions",
			Code:    500,
			Message: err.Error(),
		})
		return
	}

	// Convert to API response
	sessionResponses := make([]models.SessionResponse, len(sessions))
	for i, session := range sessions {
		sessionResponses[i] = models.SessionResponse{
			ID:           session.ID.String(),
			UserID:       session.UserID.String(),
			Title:        session.Title,
			Query:        session.Query,
			Status:       "pending", // Default status
			MessageCount: len(session.Messages),
			CreatedAt:    session.CreatedAt,
			UpdatedAt:    session.UpdatedAt,
			Tags:         parseTags(session.Tags),
		}
	}

	// Calculate pagination
	totalPages := int((total + int64(perPage) - 1) / int64(perPage))

	response := models.SessionsListResponse{
		Sessions:   sessionResponses,
		Page:       page,
		PerPage:    perPage,
		TotalPages: totalPages,
	}

	c.JSON(http.StatusOK, response)
}

// @Summary Get research session
// @Description Get a specific research session by ID
// @Tags research
// @Produce json
// @Security ApiKeyAuth
// @Param id path string true "Session ID"
// @Success 200 {object} models.SessionResponse "Session details"
// @Failure 401 {object} models.ErrorResponse "Unauthorized"
// @Failure 404 {object} models.ErrorResponse "Session not found"
// @Router /research/sessions/{id} [get]
func (h *SessionHandlers) GetSession(c *gin.Context) {
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "Unauthorized",
			Code:    401,
			Message: "User not found in context",
		})
		return
	}

	sessionID := c.Param("id")

	// Get session from service
	session, err := h.sessionService.GetSession(sessionID, userID)
	if err != nil {
		status := http.StatusInternalServerError
		if err.Error() == "session not found" {
			status = http.StatusNotFound
		}

		c.JSON(status, models.ErrorResponse{
			Error:   "Failed to fetch session",
			Code:    status,
			Message: err.Error(),
		})
		return
	}

	// Convert to API response
	response := models.SessionResponse{
		ID:           session.ID.String(),
		UserID:       session.UserID.String(),
		Title:        session.Title,
		Query:        session.Query,
		Status:       "pending", // Default status
		MessageCount: len(session.Messages),
		CreatedAt:    session.CreatedAt,
		UpdatedAt:    session.UpdatedAt,
		Tags:         parseTags(session.Tags),
	}

	c.JSON(http.StatusOK, response)
}

// @Summary Update research session
// @Description Update a specific research session
// @Tags research
// @Accept json
// @Produce json
// @Security ApiKeyAuth
// @Param id path string true "Session ID"
// @Param request body models.UpdateSessionRequest true "Session updates"
// @Success 200 {object} models.SessionResponse "Updated session"
// @Failure 400 {object} models.ErrorResponse "Invalid request"
// @Failure 401 {object} models.ErrorResponse "Unauthorized"
// @Failure 404 {object} models.ErrorResponse "Session not found"
// @Router /research/sessions/{id} [put]
func (h *SessionHandlers) UpdateSession(c *gin.Context) {
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "Unauthorized",
			Code:    401,
			Message: "User not found in context",
		})
		return
	}

	sessionID := c.Param("id")

	var req models.UpdateSessionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "Invalid request",
			Code:    400,
			Message: err.Error(),
		})
		return
	}

	// Update session using service
	session, err := h.sessionService.UpdateSession(sessionID, userID, req.Title, req.Tags)
	if err != nil {
		status := http.StatusInternalServerError
		if err.Error() == "session not found" {
			status = http.StatusNotFound
		}

		c.JSON(status, models.ErrorResponse{
			Error:   "Failed to update session",
			Code:    status,
			Message: err.Error(),
		})
		return
	}

	// Convert to API response
	response := models.SessionResponse{
		ID:           session.ID.String(),
		UserID:       session.UserID.String(),
		Title:        session.Title,
		Query:        session.Query,
		Status:       "pending", // Default status
		MessageCount: len(session.Messages),
		CreatedAt:    session.CreatedAt,
		UpdatedAt:    session.UpdatedAt,
		Tags:         parseTags(session.Tags),
	}

	c.JSON(http.StatusOK, response)
}

// @Summary Delete research session
// @Description Delete a specific research session
// @Tags research
// @Security ApiKeyAuth
// @Param id path string true "Session ID"
// @Success 204 "Session deleted successfully"
// @Failure 401 {object} models.ErrorResponse "Unauthorized"
// @Failure 404 {object} models.ErrorResponse "Session not found"
// @Router /research/sessions/{id} [delete]
func (h *SessionHandlers) DeleteSession(c *gin.Context) {
	userID, exists := middleware.GetUserIDFromContext(c)
	if !exists {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "Unauthorized",
			Code:    401,
			Message: "User not found in context",
		})
		return
	}

	sessionID := c.Param("id")

	// Delete session using service
	err := h.sessionService.DeleteSession(sessionID, userID)
	if err != nil {
		status := http.StatusInternalServerError
		if err.Error() == "session not found" {
			status = http.StatusNotFound
		}

		c.JSON(status, models.ErrorResponse{
			Error:   "Failed to delete session",
			Code:    status,
			Message: err.Error(),
		})
		return
	}

	c.Status(http.StatusNoContent)
}

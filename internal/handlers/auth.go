package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/lolzone13/DeepResearch/internal/models"
	"github.com/lolzone13/DeepResearch/internal/services"
)

// AuthHandlers holds the auth service dependency
type AuthHandlers struct {
	authService *services.AuthService
}

// NewAuthHandlers creates new auth handlers
func NewAuthHandlers(authService *services.AuthService) *AuthHandlers {
	return &AuthHandlers{
		authService: authService,
	}
}

// @Summary User login
// @Description Authenticate user with email and password
// @Tags auth
// @Accept json
// @Produce json
// @Param request body models.AuthRequest true "Login credentials"
// @Success 200 {object} models.AuthResponse "Successful login"
// @Failure 400 {object} models.ErrorResponse "Invalid request"
// @Failure 401 {object} models.ErrorResponse "Invalid credentials"
// @Router /auth/login [post]
func (h *AuthHandlers) Login(c *gin.Context) {
	var req models.AuthRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "Invalid request",
			Code:    400,
			Message: err.Error(),
		})
		return
	}

	// Authenticate user
	user, token, err := h.authService.Login(req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "Authentication failed",
			Code:    401,
			Message: err.Error(),
		})
		return
	}

	// Return success response
	response := models.AuthResponse{
		Token: token,
		User: models.UserInfo{
			ID:    user.ID.String(),
			Email: user.Email,
			Name:  user.Name,
			Role:  "user",
		},
		ExpiresAt: time.Now().Add(24 * time.Hour),
	}

	c.JSON(http.StatusOK, response)
}

// @Summary User registration
// @Description Register a new user account
// @Tags auth
// @Accept json
// @Produce json
// @Param request body models.AuthRequest true "Registration details"
// @Success 201 {object} models.AuthResponse "Successful registration"
// @Failure 400 {object} models.ErrorResponse "Invalid request"
// @Failure 409 {object} models.ErrorResponse "User already exists"
// @Router /auth/register [post]
func (h *AuthHandlers) Register(c *gin.Context) {
	var req models.AuthRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "Invalid request",
			Code:    400,
			Message: err.Error(),
		})
		return
	}

	// Validate required fields for registration
	if req.Name == "" {
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "Invalid request",
			Code:    400,
			Message: "Name is required for registration",
		})
		return
	}

	// Register user
	user, err := h.authService.Register(req.Email, req.Password, req.Name)
	if err != nil {
		status := http.StatusInternalServerError
		if err.Error() == "user already exists" {
			status = http.StatusConflict
		}

		c.JSON(status, models.ErrorResponse{
			Error:   "Registration failed",
			Code:    status,
			Message: err.Error(),
		})
		return
	}

	// Generate token for new user
	token, err := h.authService.GenerateToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, models.ErrorResponse{
			Error:   "Token generation failed",
			Code:    500,
			Message: err.Error(),
		})
		return
	}

	// Return success response
	response := models.AuthResponse{
		Token: token,
		User: models.UserInfo{
			ID:    user.ID.String(),
			Email: user.Email,
			Name:  user.Name,
			Role:  "user",
		},
		ExpiresAt: time.Now().Add(24 * time.Hour),
	}

	c.JSON(http.StatusCreated, response)
}

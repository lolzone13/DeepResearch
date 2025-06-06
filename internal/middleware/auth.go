package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/lolzone13/DeepResearch/internal/models"
	"github.com/lolzone13/DeepResearch/internal/services"
)

// AuthMiddleware creates a JWT authentication middleware
func AuthMiddleware(authService *services.AuthService) gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		// Get token from Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Error:   "Authorization header required",
				Code:    401,
				Message: "Missing Authorization header",
			})
			c.Abort()
			return
		}

		// Check if token is in Bearer format
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Error:   "Invalid authorization format",
				Code:    401,
				Message: "Authorization header must be in format: Bearer <token>",
			})
			c.Abort()
			return
		}

		tokenString := tokenParts[1]

		// Validate token
		claims, err := authService.ValidateToken(tokenString)
		if err != nil {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Error:   "Invalid token",
				Code:    401,
				Message: err.Error(),
			})
			c.Abort()
			return
		}

		// Get user from database
		user, err := authService.GetUserByID(claims.UserID)
		if err != nil {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Error:   "User not found",
				Code:    401,
				Message: "Token is valid but user no longer exists",
			})
			c.Abort()
			return
		}

		// Set user info in context for use in handlers
		c.Set("user", user)
		c.Set("user_id", user.ID.String())
		c.Set("user_email", user.Email)

		c.Next()
	})
}

// OptionalAuthMiddleware is like AuthMiddleware but doesn't abort on missing auth
func OptionalAuthMiddleware(authService *services.AuthService) gin.HandlerFunc {
	return gin.HandlerFunc(func(c *gin.Context) {
		// Get token from Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.Next()
			return
		}

		// Check if token is in Bearer format
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			c.Next()
			return
		}

		tokenString := tokenParts[1]

		// Validate token
		claims, err := authService.ValidateToken(tokenString)
		if err != nil {
			c.Next()
			return
		}

		// Get user from database
		user, err := authService.GetUserByID(claims.UserID)
		if err != nil {
			c.Next()
			return
		}

		// Set user info in context for use in handlers
		c.Set("user", user)
		c.Set("user_id", user.ID.String())
		c.Set("user_email", user.Email)

		c.Next()
	})
}

// GetUserFromContext extracts user information from Gin context
func GetUserFromContext(c *gin.Context) (*models.User, bool) {
	if user, exists := c.Get("user"); exists {
		if u, ok := user.(*models.User); ok {
			return u, true
		}
	}
	return nil, false
}

// GetUserIDFromContext extracts user ID from Gin context
func GetUserIDFromContext(c *gin.Context) (string, bool) {
	if userID, exists := c.Get("user_id"); exists {
		if id, ok := userID.(string); ok {
			return id, true
		}
	}
	return "", false
}

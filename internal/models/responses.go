package models

import "time"

// HealthResponse represents the health check response
type HealthResponse struct {
	Status    string `json:"status" example:"healthy"`
	Timestamp string `json:"timestamp" example:"2025-06-07T01:11:28Z"`
	Version   string `json:"version" example:"1.0.0"`
} // @name HealthResponse

// ErrorResponse represents an error response
type ErrorResponse struct {
	Error   string `json:"error" example:"Invalid request"`
	Code    int    `json:"code" example:"400"`
	Message string `json:"message" example:"The request is malformed"`
} // @name ErrorResponse

// AuthRequest represents login/register request
type AuthRequest struct {
	Email    string `json:"email" binding:"required,email" example:"user@example.com"`
	Password string `json:"password" binding:"required,min=6" example:"password123"`
	Name     string `json:"name,omitempty" example:"John Doe"`
} // @name AuthRequest

// AuthResponse represents login/register response
type AuthResponse struct {
	Token     string    `json:"token" example:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`
	User      UserInfo  `json:"user"`
	ExpiresAt time.Time `json:"expires_at" example:"2025-06-08T01:11:28Z"`
} // @name AuthResponse

// UserInfo represents user information
type UserInfo struct {
	ID    string `json:"id" example:"123e4567-e89b-12d3-a456-426614174000"`
	Email string `json:"email" example:"user@example.com"`
	Name  string `json:"name" example:"John Doe"`
	Role  string `json:"role" example:"user"`
} // @name UserInfo

// CreateSessionRequest represents request to create a research session
type CreateSessionRequest struct {
	Query       string   `json:"query" binding:"required" example:"What are the latest developments in AI?"`
	Title       string   `json:"title,omitempty" example:"AI Research Session"`
	Tags        []string `json:"tags,omitempty" example:"ai,research,technology"`
	MaxSources  int      `json:"max_sources,omitempty" example:"10"`
	SearchDepth string   `json:"search_depth,omitempty" example:"deep" enums:"shallow,medium,deep"`
} // @name CreateSessionRequest

// SessionResponse represents a research session response
type SessionResponse struct {
	ID           string    `json:"id" example:"123e4567-e89b-12d3-a456-426614174000"`
	UserID       string    `json:"user_id" example:"456e7890-e89b-12d3-a456-426614174001"`
	Title        string    `json:"title" example:"AI Research Session"`
	Query        string    `json:"query" example:"What are the latest developments in AI?"`
	Status       string    `json:"status" example:"active" enums:"active,completed,failed"`
	MessageCount int       `json:"message_count" example:"5"`
	CreatedAt    time.Time `json:"created_at" example:"2025-06-07T01:11:28Z"`
	UpdatedAt    time.Time `json:"updated_at" example:"2025-06-07T01:15:28Z"`
	Tags         []string  `json:"tags" example:"ai,research,technology"`
} // @name SessionResponse

// SessionsListResponse represents list of sessions response
type SessionsListResponse struct {
	Sessions   []SessionResponse `json:"sessions"`
	Total      int               `json:"total" example:"25"`
	Page       int               `json:"page" example:"1"`
	PerPage    int               `json:"per_page" example:"10"`
	TotalPages int               `json:"total_pages" example:"3"`
} // @name SessionsListResponse

// UpdateSessionRequest represents request to update a research session
type UpdateSessionRequest struct {
	Title string   `json:"title,omitempty" example:"Updated AI Research Session"`
	Tags  []string `json:"tags,omitempty" example:"ai,research,technology,updated"`
} // @name UpdateSessionRequest

// ResearchProgressEvent represents a research progress event for SSE
type ResearchProgressEvent struct {
	Step      string `json:"step" example:"Finding relevant sources..."`
	Progress  int    `json:"progress" example:"25"`
	Timestamp string `json:"timestamp" example:"2025-06-07T01:11:28Z"`
	Sources   int    `json:"sources,omitempty" example:"3"`
	Status    string `json:"status" example:"processing" enums:"processing,completed,error"`
} // @name ResearchProgressEvent

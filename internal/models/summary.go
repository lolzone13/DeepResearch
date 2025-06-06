package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Summary represents AI-generated summaries and insights
type Summary struct {
	ID              uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	SessionID       uuid.UUID `gorm:"type:uuid;not null;index" json:"session_id"`
	Type            string    `gorm:"not null" json:"type"` // overview, detailed, key_points, conclusion
	Title           string    `gorm:"not null" json:"title"`
	Content         string    `gorm:"type:text;not null" json:"content"`
	KeyPoints       string    `gorm:"type:text" json:"key_points"` // JSON array of key points
	SourcesUsed     int       `gorm:"default:0" json:"sources_used"`
	ConfidenceScore float64   `gorm:"default:0.0" json:"confidence_score"` // 0-1
	GeneratedBy     string    `gorm:"default:'ai'" json:"generated_by"`    // ai, human
	GeneratedAt     time.Time `json:"generated_at"`
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`

	// Relationships
	Session ResearchSession `gorm:"foreignKey:SessionID" json:"session,omitempty"`
}

// BeforeCreate will set a UUID rather than numeric ID
func (s *Summary) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	if s.GeneratedAt.IsZero() {
		s.GeneratedAt = time.Now()
	}
	return nil
}

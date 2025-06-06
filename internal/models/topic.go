package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Topic represents a research topic/query
type Topic struct {
	ID          uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID      uuid.UUID      `gorm:"type:uuid;not null;index" json:"user_id"`
	Title       string         `gorm:"not null" json:"title"`
	Description string         `gorm:"type:text" json:"description"`
	Query       string         `gorm:"not null" json:"query"`           // Original search query
	Status      string         `gorm:"default:'pending'" json:"status"` // pending, processing, completed, failed
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	User             User              `gorm:"foreignKey:UserID" json:"user,omitempty"`
	ResearchSessions []ResearchSession `gorm:"foreignKey:TopicID" json:"research_sessions,omitempty"`
	Documents        []Document        `gorm:"foreignKey:TopicID" json:"documents,omitempty"`
	Summaries        []Summary         `gorm:"foreignKey:TopicID" json:"summaries,omitempty"`
}

// BeforeCreate will set a UUID rather than numeric ID
func (t *Topic) BeforeCreate(tx *gorm.DB) error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	return nil
}

package models

import (
	"time"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ThoughtType string

const (
	ThoughtTypeSearching    ThoughtType = "searching"
	ThoughtTypeAnalyzing    ThoughtType = "analyzing"
	ThoughtTypeSynthesizing ThoughtType = "synthesizing"
	ThoughtTypeValidating   ThoughtType = "validating"
	ThoughtTypeCompleted    ThoughtType = "completed"
	ThoughtTypeError        ThoughtType = "error"
)

// Thought represents intermediate processing steps during research
type Thought struct {
	ID          uuid.UUID   `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	MessageID   uuid.UUID   `gorm:"type:uuid;not null;index" json:"message_id"`
	Type        ThoughtType `gorm:"not null" json:"type"`
	Title       string      `gorm:"not null" json:"title"`
	Content     string      `gorm:"type:text" json:"content"`
	Status      string      `gorm:"default:'processing'" json:"status"` // processing, completed, failed
	Progress    int         `gorm:"default:0" json:"progress"`          // 0-100
	Metadata    string      `gorm:"type:jsonb" json:"metadata"`         // Additional data (URLs, sources, etc.)
	StartedAt   time.Time   `json:"started_at"`
	CompletedAt *time.Time  `json:"completed_at,omitempty"`
	CreatedAt   time.Time   `json:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at"`

	// Relationships
	Message Message `gorm:"foreignKey:MessageID" json:"message,omitempty"`
}

// BeforeCreate will set UUIDs and timestamps
func (t *Thought) BeforeCreate(tx *gorm.DB) error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	if t.StartedAt.IsZero() {
		t.StartedAt = time.Now()
	}
	return nil
}

// Helper methods for thought management
func (t *Thought) MarkCompleted() {
	now := time.Now()
	t.CompletedAt = &now
	t.Status = "completed"
	t.Progress = 100
}

func (t *Thought) MarkFailed(errorMsg string) {
	now := time.Now()
	t.CompletedAt = &now
	t.Status = "failed"
	t.Content = errorMsg
}

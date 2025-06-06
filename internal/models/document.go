package models

import (
	"time"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Document represents ingested content from a source
type Document struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	SessionID   uuid.UUID `gorm:"type:uuid;not null;index" json:"session_id"`
	SourceID    uuid.UUID `gorm:"type:uuid;not null;index" json:"source_id"`
	Title       string    `gorm:"not null" json:"title"`
	Content     string    `gorm:"type:text;not null" json:"content"`
	ContentType string    `gorm:"not null" json:"content_type"` // html, pdf, markdown, plain_text
	WordCount   int       `json:"word_count"`
	Language    string    `gorm:"default:'en'" json:"language"`
	Relevance   float64   `gorm:"default:0.0" json:"relevance"` // AI-calculated relevance score 0-1
	ProcessedAt time.Time `json:"processed_at"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// Relationships
	Session ResearchSession `gorm:"foreignKey:SessionID" json:"session,omitempty"`
	Source  Source          `gorm:"foreignKey:SourceID" json:"source,omitempty"`
}

// BeforeCreate will set a UUID rather than numeric ID
func (d *Document) BeforeCreate(tx *gorm.DB) error {
	if d.ID == uuid.Nil {
		d.ID = uuid.New()
	}
	if d.ProcessedAt.IsZero() {
		d.ProcessedAt = time.Now()
	}
	return nil
}

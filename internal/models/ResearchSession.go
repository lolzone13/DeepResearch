package models

import (
	"time"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ResearchSession struct {
	ID           uuid.UUID      `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID       uuid.UUID      `gorm:"type:uuid;not null" json:"user_id"`
	Title        string         `gorm:"not null" json:"title"`
	Description  string         `gorm:"not null" json:"description"`
	Tags         string         `gorm:"type:text" json:"tags"` // JSON string of tags
	MessageCount int            `gorm:"default:0" json:"message_count"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
	Query        string         `gorm:"not null" json:"query"` // Original search query

	// Relationships
	User      User       `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Messages  []Message  `gorm:"foreignKey:SessionID" json:"messages,omitempty"`
	Sources   []Source   `gorm:"foreignKey:SessionID" json:"sources,omitempty"`
	Documents []Document `gorm:"foreignKey:SessionID" json:"documents,omitempty"`
}

// BeforeCreate will set UUIDs and timestamps
func (rs *ResearchSession) BeforeCreate(tx *gorm.DB) error {
	if rs.ID == uuid.Nil {
		rs.ID = uuid.New()
	}
	return nil
}
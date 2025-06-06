package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type MessageType string

const (
	MessageTypeUser      MessageType = "user"
	MessageTypeAssistant MessageType = "assistant"
	MessageTypeSystem    MessageType = "system"
)

// Message represents a conversation message in a research session
type Message struct {
	ID        uuid.UUID   `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	SessionID uuid.UUID   `gorm:"type:uuid;not null;index" json:"session_id"`
	Type      MessageType `gorm:"not null" json:"type"`
	Content   string      `gorm:"type:text;not null" json:"content"`
	IsVisible bool        `gorm:"default:true" json:"is_visible"` // Whether to show in chat UI
	CreatedAt time.Time   `json:"created_at"`
	UpdatedAt time.Time   `json:"updated_at"`

	// Relationships
	Session  ResearchSession `gorm:"foreignKey:SessionID" json:"session,omitempty"`
	Thoughts []Thought       `gorm:"foreignKey:MessageID" json:"thoughts,omitempty"`
	Sources  []Source        `gorm:"many2many:message_sources" json:"sources,omitempty"` // Many-to-many with sources
}

// BeforeCreate will set UUIDs and timestamps
func (m *Message) BeforeCreate(tx *gorm.DB) error {
	if m.ID == uuid.Nil {
		m.ID = uuid.New()
	}
	return nil
}

package models

import (
	"time"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Source represents an external source we can crawl
type Source struct {
	ID          uuid.UUID  `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	SessionID   uuid.UUID  `gorm:"type:uuid;not null;index" json:"session_id"`
	URL         string     `gorm:"uniqueIndex;not null" json:"url"`
	Type        string     `gorm:"not null" json:"type"` // website, pdf, academic_paper, news_article
	Domain      string     `gorm:"index" json:"domain"`
	Title       string     `json:"title"`
	Description string     `gorm:"type:text" json:"description"`
	Language    string     `gorm:"default:'en'" json:"language"`
	IsActive    bool       `gorm:"default:true" json:"is_active"`
	LastCrawled *time.Time `json:"last_crawled,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`

	// Relationships
	Session   ResearchSession `gorm:"foreignKey:SessionID" json:"session,omitempty"`
	Documents []Document      `gorm:"foreignKey:SourceID" json:"documents,omitempty"`
	Messages  []Message       `gorm:"many2many:message_sources" json:"messages,omitempty"` // Many-to-many with messages
}

// BeforeCreate will set a UUID rather than numeric ID
func (s *Source) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}

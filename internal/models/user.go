package models

import (
	"time"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type UserRole string

const (
	RoleUser UserRole = "user"
	RoleAdmin UserRole = "admin"
)

// User represents a user in the system
type User struct {
    ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
    Email     string    `gorm:"uniqueIndex;not null" json:"email"`
    PasswordHash  string    `gorm:"not null" json:"-"` // "-" excludes password from JSON
    Name      string    `gorm:"not null" json:"name"`
	Roles 	  UserRole `gorm:"default:'user'" json:"roles"`
	IsEmailVerified bool          `gorm:"default:false"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
    DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

    // Relationships
    ResearchSessions []ResearchSession `gorm:"foreignKey:UserID" json:"research_sessions,omitempty"`
}

// BeforeCreate will set a UUID rather than numeric ID
func (u *User) BeforeCreate(tx *gorm.DB) error {
    if u.ID == uuid.Nil {
        u.ID = uuid.New()
    }
    return nil
}
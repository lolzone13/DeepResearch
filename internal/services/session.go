package services

import (
	"encoding/json"
	"errors"

	"github.com/google/uuid"
	"github.com/lolzone13/DeepResearch/internal/models"
	"gorm.io/gorm"
)

// SessionService handles research session operations
type SessionService struct {
	db *gorm.DB
}

// NewSessionService creates a new session service
func NewSessionService(db *gorm.DB) *SessionService {
	return &SessionService{db: db}
}

// CreateSession creates a new research session
func (s *SessionService) CreateSession(userID, title, query string, tags []string) (*models.ResearchSession, error) {
	// Convert userID string to UUID
	userUUID, err := uuid.Parse(userID)
	if err != nil {
		return nil, errors.New("invalid user ID")
	}

	// Convert tags to JSON string
	tagsJSON, err := json.Marshal(tags)
	if err != nil {
		return nil, err
	}

	session := models.ResearchSession{
		UserID:      userUUID,
		Title:       title,
		Query:       query,
		Description: "Research session for: " + query,
		Tags:        string(tagsJSON),
	}

	if err := s.db.Create(&session).Error; err != nil {
		return nil, err
	}

	return &session, nil
}

// GetSession retrieves a session by ID and user ID
func (s *SessionService) GetSession(sessionID, userID string) (*models.ResearchSession, error) {
	sessionUUID, err := uuid.Parse(sessionID)
	if err != nil {
		return nil, errors.New("invalid session ID")
	}

	userUUID, err := uuid.Parse(userID)
	if err != nil {
		return nil, errors.New("invalid user ID")
	}

	var session models.ResearchSession
	err = s.db.Where("id = ? AND user_id = ?", sessionUUID, userUUID).
		Preload("Messages").
		Preload("Sources").
		First(&session).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("session not found")
		}
		return nil, err
	}

	return &session, nil
}

// ListSessions retrieves paginated sessions for a user
func (s *SessionService) ListSessions(userID string, page, perPage int, status string) ([]models.ResearchSession, int64, error) {
	userUUID, err := uuid.Parse(userID)
	if err != nil {
		return nil, 0, errors.New("invalid user ID")
	}

	var sessions []models.ResearchSession
	var total int64

	query := s.db.Where("user_id = ?", userUUID)

	// Note: Since we don't have a status field in the current model, we'll ignore the status filter for now
	// This can be added when the model is updated

	// Count total records
	if err := query.Model(&models.ResearchSession{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply pagination
	offset := (page - 1) * perPage
	if err := query.Offset(offset).Limit(perPage).Order("created_at DESC").Find(&sessions).Error; err != nil {
		return nil, 0, err
	}

	return sessions, total, nil
}

// UpdateSession updates a session's title and tags
func (s *SessionService) UpdateSession(sessionID, userID string, title string, tags []string) (*models.ResearchSession, error) {
	sessionUUID, err := uuid.Parse(sessionID)
	if err != nil {
		return nil, errors.New("invalid session ID")
	}

	userUUID, err := uuid.Parse(userID)
	if err != nil {
		return nil, errors.New("invalid user ID")
	}

	var session models.ResearchSession

	// First check if session exists and belongs to user
	err = s.db.Where("id = ? AND user_id = ?", sessionUUID, userUUID).First(&session).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("session not found")
		}
		return nil, err
	}

	// Convert tags to JSON string
	tagsJSON, err := json.Marshal(tags)
	if err != nil {
		return nil, err
	}

	// Update fields
	updates := models.ResearchSession{
		Title: title,
		Tags:  string(tagsJSON),
	}

	if err := s.db.Model(&session).Updates(updates).Error; err != nil {
		return nil, err
	}

	// Return updated session
	return s.GetSession(sessionID, userID)
}

// DeleteSession deletes a session
func (s *SessionService) DeleteSession(sessionID, userID string) error {
	sessionUUID, err := uuid.Parse(sessionID)
	if err != nil {
		return errors.New("invalid session ID")
	}

	userUUID, err := uuid.Parse(userID)
	if err != nil {
		return errors.New("invalid user ID")
	}

	result := s.db.Where("id = ? AND user_id = ?", sessionUUID, userUUID).Delete(&models.ResearchSession{})
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errors.New("session not found")
	}

	return nil
}

// GetSessionStats returns statistics for a user's sessions
func (s *SessionService) GetSessionStats(userID string) (map[string]interface{}, error) {
	userUUID, err := uuid.Parse(userID)
	if err != nil {
		return nil, errors.New("invalid user ID")
	}

	var total int64

	// Count total sessions
	if err := s.db.Model(&models.ResearchSession{}).Where("user_id = ?", userUUID).Count(&total).Error; err != nil {
		return nil, err
	}

	result := map[string]interface{}{
		"total": total,
		// Note: Since we don't have status field, we'll just return total for now
		"active":    0,
		"completed": 0,
		"pending":   0,
	}

	return result, nil
}

// Helper function to parse tags from JSON string
func (s *SessionService) ParseTags(tagsJSON string) ([]string, error) {
	var tags []string
	if tagsJSON == "" {
		return tags, nil
	}
	err := json.Unmarshal([]byte(tagsJSON), &tags)
	return tags, err
}

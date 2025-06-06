package services

import (
	"time"

	"github.com/lolzone13/DeepResearch/internal/config"
	"github.com/lolzone13/DeepResearch/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DatabaseService handles all database operations
type DatabaseService struct {
	db *gorm.DB
}

// NewDatabaseService creates a new database service instance
func NewDatabaseService(cfg *config.Config) (*DatabaseService, error) {
	// Configure GORM with connection pool settings
	db, err := gorm.Open(postgres.Open(cfg.GetDatabaseDSN()), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return nil, err
	}

	// Configure connection pool
	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}

	sqlDB.SetMaxOpenConns(cfg.Database.MaxOpenConns)
	sqlDB.SetMaxIdleConns(cfg.Database.MaxIdleConns)
	sqlDB.SetConnMaxLifetime(time.Duration(cfg.Database.ConnMaxLifetime) * time.Minute)

	// Auto-migrate the schema
	err = db.AutoMigrate(
		&models.User{},
		&models.ResearchSession{},
		&models.Message{},
		&models.Source{},
		&models.Document{},
	)
	if err != nil {
		return nil, err
	}

	return &DatabaseService{db: db}, nil
}

// GetDB returns the underlying GORM database instance
func (s *DatabaseService) GetDB() *gorm.DB {
	return s.db
}

// Close closes the database connection
func (s *DatabaseService) Close() error {
	sqlDB, err := s.db.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}

// Health checks database connectivity
func (s *DatabaseService) Health() error {
	sqlDB, err := s.db.DB()
	if err != nil {
		return err
	}
	return sqlDB.Ping()
}

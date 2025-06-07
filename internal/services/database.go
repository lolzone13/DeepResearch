package services

import (
	"log"
	"os"
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
	// Create custom logger that's quieter for production
	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags), // io writer
		logger.Config{
			SlowThreshold:             time.Second,  // Only log queries slower than 1 second
			LogLevel:                  logger.Error, // Only log errors by default
			IgnoreRecordNotFoundError: true,         // Ignore ErrRecordNotFound error for logger
			Colorful:                  false,        // Disable color in production
		},
	)

	// Allow debug mode via environment variable
	if os.Getenv("DB_DEBUG") == "true" {
		newLogger = logger.Default.LogMode(logger.Info)
	}

	// Configure GORM with optimized settings
	db, err := gorm.Open(postgres.Open(cfg.GetDatabaseDSN()), &gorm.Config{
		Logger:                                   newLogger,
		PrepareStmt:                              true,  // Enable prepared statement caching
		DisableForeignKeyConstraintWhenMigrating: false, // Keep foreign keys for data integrity
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

	// Auto-migrate the schema (this process checks and creates tables/indexes)
	// First startup will be slower as it creates the schema
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

package database

import (
	"fmt"
	"log"

	"github.com/lolzone13/DeepResearch/internal/config"
	"github.com/lolzone13/DeepResearch/internal/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type DB struct {
	*gorm.DB
}

// NewDatabase creates a new database connection
func NewDatabase(cfg *config.Config) (*DB, error) {
	dsn := cfg.GetDatabaseDSN()
	
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	return &DB{db}, nil
}

// AutoMigrate runs database migrations for all models
func (db *DB) AutoMigrate() error {
	log.Println("Running database migrations...")
	
	err := db.DB.AutoMigrate(models.AllModels()...)
	if err != nil {
		return fmt.Errorf("failed to run migrations: %w", err)
	}
	
	log.Println("Database migrations completed successfully")
	return nil
}

// Close closes the database connection
func (db *DB) Close() error {
	sqlDB, err := db.DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}

// Health checks if the database connection is healthy
func (db *DB) Health() error {
	sqlDB, err := db.DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Ping()
}

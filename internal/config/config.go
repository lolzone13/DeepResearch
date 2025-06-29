package config

import (
	"fmt"

	"github.com/spf13/viper"
)

// Config holds all configuration for our application
type Config struct {
	Server struct {
		Port int    `mapstructure:"port"`
		Host string `mapstructure:"host"`
	} `mapstructure:"server"`

	Database struct {
		// Service URI (used by cloud providers like Supabase, Railway, Neon)
		ServiceURI string `mapstructure:"service_uri"`

		// Traditional connection parameters (fallback if ServiceURI is not provided)
		Host     string `mapstructure:"host"`
		Port     int    `mapstructure:"port"`
		User     string `mapstructure:"user"`
		Password string `mapstructure:"password"`
		DBName   string `mapstructure:"dbname"`
		SSLMode  string `mapstructure:"sslmode"`

		// Connection pool settings
		MaxOpenConns    int `mapstructure:"max_open_conns"`
		MaxIdleConns    int `mapstructure:"max_idle_conns"`
		ConnMaxLifetime int `mapstructure:"conn_max_lifetime"` // in minutes
	} `mapstructure:"database"`

	Redis struct {
		Addr     string `mapstructure:"addr"`
		Password string `mapstructure:"password"`
		DB       int    `mapstructure:"db"`
	} `mapstructure:"redis"`

	JWT struct {
		Secret      string `mapstructure:"secret"`
		ExpiryHours int    `mapstructure:"expiry_hours"`
	} `mapstructure:"jwt"`

	GRPC struct {
		Port int    `mapstructure:"port"`
		Host string `mapstructure:"host"`
	} `mapstructure:"grpc"`
}

func LoadConfig(env string) (*Config, error) {

	v := viper.New()
	v.AddConfigPath("configs")
	v.SetConfigName(env)
	v.SetConfigType("yaml")
	v.AutomaticEnv()

	if err := v.ReadInConfig(); err != nil {
		return nil, fmt.Errorf("failed to read config file: %w", err)
	}

	var config Config
	if err := v.Unmarshal(&config); err != nil {
		return nil, fmt.Errorf("failed to unmarshal config: %w", err)
	}

	return &config, nil
}

// GetDatabaseDSN returns the database connection string
func (c *Config) GetDatabaseDSN() string {
	// If ServiceURI is provided, use it directly (cloud providers)
	if c.Database.ServiceURI != "" {
		return c.Database.ServiceURI
	}

	// Otherwise, build DSN from individual parameters (local/traditional setup)
	return fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
		c.Database.Host,
		c.Database.Port,
		c.Database.User,
		c.Database.Password,
		c.Database.DBName,
		c.Database.SSLMode,
	)
}

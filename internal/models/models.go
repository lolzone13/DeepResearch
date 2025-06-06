package models

// AllModels returns all models for auto-migration
func AllModels() []interface{} {
	return []interface{}{
		&User{},
		&ResearchSession{},
		&Message{},
		&Thought{},
		&Source{},
		&Document{},
	}
}

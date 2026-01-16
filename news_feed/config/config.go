package config

import (
	"bufio"
	"encoding/json"
	"log"
	"os"
	"strings"
)

// AppConfig holds the file-based configuration
type AppConfig struct {
	UpdateIntervalMin int    `json:"update_interval_min_seconds"`
	UpdateIntervalMax int    `json:"update_interval_max_seconds"`
	StoriesLimit      int    `json:"stories_limit"`
	HNBaseURL         string `json:"hn_api_url"`
	MaxSavedStories   int    `json:"max_saved_stories"`
}

// EnvConfig holds the environment configuration
type EnvConfig struct {
	PocketBaseURL string
	AdminEmail    string
	AdminPassword string
}

func LoadAppConfig(path string) AppConfig {
	// Default config
	cfg := AppConfig{
		UpdateIntervalMin: 60,
		UpdateIntervalMax: 60,
		StoriesLimit:      100,
		HNBaseURL:         "https://hacker-news.firebaseio.com/v0",
		MaxSavedStories:   5000,
	}

	file, err := os.Open(path)
	if err != nil {
		log.Printf("Warning: %s not found, using defaults: %v", path, err)
		return cfg
	}
	defer file.Close()

	if err := json.NewDecoder(file).Decode(&cfg); err != nil {
		log.Printf("Warning: failed to decode %s: %v", path, err)
	}
	return cfg
}

func LoadEnv(path string) {
	file, err := os.Open(path)
	if err != nil {
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		parts := strings.SplitN(line, "=", 2)
		if len(parts) == 2 {
			key := strings.TrimSpace(parts[0])
			val := strings.TrimSpace(parts[1])
			os.Setenv(key, val)
		}
	}
}

func LoadEnvConfig() EnvConfig {
	pbURL := os.Getenv("POCKETBASE_URL")
	if pbURL == "" {
		pbURL = "http://127.0.0.1:8090"
	}
	return EnvConfig{
		PocketBaseURL: pbURL,
		AdminEmail:    os.Getenv("PB_ADMIN_EMAIL"),
		AdminPassword: os.Getenv("PB_ADMIN_PASSWORD"),
	}
}

package main

import (
	"log"
	"math/rand"
	"net/http"
	"sync"
	"time"

	"news_feed/config"
	"news_feed/hackernews"
	"news_feed/pocketbase"
)

// Global generic http client
var httpClient = &http.Client{Timeout: 30 * time.Second}

func main() {
	log.Println("Starting News Feed Service (Background Worker)...")

	// 1. Load configuration
	config.LoadEnv(".env")
	envCfg := config.LoadEnvConfig()
	appCfg := config.LoadAppConfig("config.json")

	log.Printf("Loaded Config: Limit=%d, Interval=%d-%ds, MaxSaved=%d",
		appCfg.StoriesLimit, appCfg.UpdateIntervalMin, appCfg.UpdateIntervalMax, appCfg.MaxSavedStories)

	// 2. Init Clients
	pbClient := pocketbase.NewClient(envCfg.PocketBaseURL, httpClient)
	hnClient := hackernews.NewClient(appCfg.HNBaseURL, httpClient)

	// 3. Authenticate
	pbClient.Authenticate(envCfg.AdminEmail, envCfg.AdminPassword)

	// 4. Start Loop
	log.Println("Initial sync started...")
	syncStories(pbClient, hnClient, appCfg)
	pbClient.CleanupOldStories(appCfg.MaxSavedStories)
	log.Println("Initial sync completed.")

	for {
		// Calculate random duration
		min := appCfg.UpdateIntervalMin
		max := appCfg.UpdateIntervalMax
		if min < 1 {
			min = 60
		}
		if max <= min {
			max = min + 10
		}

		seconds := rand.Intn(max-min) + min
		duration := time.Duration(seconds) * time.Second

		log.Printf("Next sync in %v...", duration)
		time.Sleep(duration)

		// Re-auth/Refresh config if needed
		pbClient.Authenticate(envCfg.AdminEmail, envCfg.AdminPassword)
		syncStories(pbClient, hnClient, appCfg)
		pbClient.CleanupOldStories(appCfg.MaxSavedStories)
	}
}

func syncStories(pbClient *pocketbase.Client, hnClient *hackernews.Client, appCfg config.AppConfig) {
	log.Printf("Fetching latest %d stories from HN...", appCfg.StoriesLimit)

	ids, err := hnClient.FetchNewStories(appCfg.StoriesLimit)
	if err != nil {
		log.Printf("Failed to fetch new stories: %v", err)
		return
	}

	numWorkers := 10
	jobs := make(chan int, len(ids))
	var wg sync.WaitGroup
	wg.Add(numWorkers)

	for i := 0; i < numWorkers; i++ {
		go func() {
			defer wg.Done()
			for id := range jobs {
				processStory(pbClient, hnClient, id)
			}
		}()
	}

	for _, id := range ids {
		jobs <- id
	}
	close(jobs)

	wg.Wait()
}

func processStory(pbClient *pocketbase.Client, hnClient *hackernews.Client, id int) {
	story, err := hnClient.FetchStoryDetails(id)
	if err != nil {
		log.Printf("Failed to fetch HN story %d: %v", id, err)
		return
	}

	if story.Type != "story" && story.Type != "link" {
		return
	}

	pbID, exists, err := pbClient.FindRecord(id)
	if err != nil {
		log.Printf("Failed to check existence for %d: %v", id, err)
		return
	}

	if exists {
		if err := pbClient.UpdateRecord(pbID, story); err != nil {
			log.Printf("Failed to update story %d: %v", id, err)
		}
	} else {
		if err := pbClient.CreateRecord(story); err != nil {
			log.Printf("Failed to create story %d: %v", id, err)
		}
	}
}

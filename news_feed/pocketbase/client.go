package pocketbase

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"time"

	"news_feed/models"
)

type Client struct {
	BaseURL    string
	HTTPClient *http.Client
	Token      string
}

func NewClient(baseURL string, httpClient *http.Client) *Client {
	return &Client{
		BaseURL:    baseURL,
		HTTPClient: httpClient,
	}
}

func (c *Client) Authenticate(email, password string) string {
	if email == "" || password == "" {
		return ""
	}

	body := map[string]string{
		"identity": email,
		"password": password,
	}
	jsonBody, _ := json.Marshal(body)

	resp, err := c.HTTPClient.Post(c.BaseURL+"/api/admins/auth-with-password", "application/json", bytes.NewBuffer(jsonBody))
	if err != nil {
		log.Printf("Auth failed: %v", err)
		return ""
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return ""
	}

	var res map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&res); err != nil {
		return ""
	}

	token, ok := res["token"].(string)
	if !ok {
		return ""
	}
	c.Token = token
	return token
}

func (c *Client) FindRecord(storyID int) (string, bool, error) {
	filter := fmt.Sprintf("storyId='%d'", storyID)
	url := fmt.Sprintf("%s/api/collections/news_feed/records?filter=(%s)&perPage=1&fields=id", c.BaseURL, filter)

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return "", false, err
	}
	if c.Token != "" {
		req.Header.Set("Authorization", c.Token)
	}

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return "", false, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return "", false, fmt.Errorf("status %d", resp.StatusCode)
	}

	var result models.PBListResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", false, err
	}

	if len(result.Items) > 0 {
		return result.Items[0].ID, true, nil
	}
	return "", false, nil
}

func (c *Client) CreateRecord(story models.HNStory) error {
	body := buildJSONBody(story)
	url := c.BaseURL + "/api/collections/news_feed/records"
	req, err := http.NewRequest("POST", url, bytes.NewBuffer(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	if c.Token != "" {
		req.Header.Set("Authorization", c.Token)
	}

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 && resp.StatusCode != 204 {
		return fmt.Errorf("status %d", resp.StatusCode)
	}
	return nil
}

func (c *Client) UpdateRecord(recordID string, story models.HNStory) error {
	body := buildJSONBody(story)
	url := fmt.Sprintf("%s/api/collections/news_feed/records/%s", c.BaseURL, recordID)
	req, err := http.NewRequest("PATCH", url, bytes.NewBuffer(body))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	if c.Token != "" {
		req.Header.Set("Authorization", c.Token)
	}

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 && resp.StatusCode != 204 {
		return fmt.Errorf("status %d", resp.StatusCode)
	}
	return nil
}

func (c *Client) CleanupOldStories(maxSaved int) {
	if maxSaved <= 0 {
		return
	}

	// 1. Get total count
	url := fmt.Sprintf("%s/api/collections/news_feed/records?perPage=1&fields=id", c.BaseURL)
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		log.Printf("Cleanup Check Error: %v", err)
		return
	}
	if c.Token != "" {
		req.Header.Set("Authorization", c.Token)
	}

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		log.Printf("Cleanup Check Error: %v", err)
		return
	}
	defer resp.Body.Close()

	var result models.PBListResponse
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return
	}

	if result.TotalItems <= maxSaved {
		return
	}

	toDeleteCount := result.TotalItems - maxSaved
	log.Printf("Cleaning up %d old stories (Total: %d, Max: %d)...", toDeleteCount, result.TotalItems, maxSaved)

	perPage := 500
	if toDeleteCount < perPage {
		perPage = toDeleteCount
	}

	fetchUrl := fmt.Sprintf("%s/api/collections/news_feed/records?sort=+postedAt&perPage=%d&page=1&fields=id", c.BaseURL, perPage)

	reqFetch, _ := http.NewRequest("GET", fetchUrl, nil)
	if c.Token != "" {
		reqFetch.Header.Set("Authorization", c.Token)
	}

	respFetch, err := c.HTTPClient.Do(reqFetch)
	if err != nil {
		log.Printf("Cleanup Fetch Error: %v", err)
		return
	}
	defer respFetch.Body.Close()

	var itemsToDelete models.PBListResponse
	if err := json.NewDecoder(respFetch.Body).Decode(&itemsToDelete); err != nil {
		return
	}

	// Delete found items
	for _, item := range itemsToDelete.Items {
		delUrl := fmt.Sprintf("%s/api/collections/news_feed/records/%s", c.BaseURL, item.ID)
		reqDel, _ := http.NewRequest("DELETE", delUrl, nil)
		if c.Token != "" {
			reqDel.Header.Set("Authorization", c.Token)
		}
		c.HTTPClient.Do(reqDel)           // ignore error for individual delete
		time.Sleep(10 * time.Millisecond) // throttling slightly
	}

	log.Printf("Cleanup finished. Deleted %d records.", len(itemsToDelete.Items))
}

func buildJSONBody(story models.HNStory) []byte {
	postedAt := time.Unix(story.Time, 0).UTC().Format("2006-01-02 15:04:05.000Z")
	rec := map[string]interface{}{
		"storyId":       strconv.Itoa(story.ID),
		"title":         story.Title,
		"url":           story.URL,
		"author":        story.By,
		"score":         story.Score,
		"postedAt":      postedAt,
		"commentsCount": story.Descendants,
	}
	b, _ := json.Marshal(rec)
	return b
}

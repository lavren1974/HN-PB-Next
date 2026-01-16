package hackernews

import (
	"encoding/json"
	"fmt"
	"net/http"

	"news_feed/models"
)

type Client struct {
	HTTPClient *http.Client
	BaseURL    string
}

func NewClient(baseURL string, httpClient *http.Client) *Client {
	return &Client{
		HTTPClient: httpClient,
		BaseURL:    baseURL,
	}
}

func (c *Client) FetchNewStories(limit int) ([]int, error) {
	url := fmt.Sprintf("%s/newstories.json", c.BaseURL)
	resp, err := c.HTTPClient.Get(url)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch new stories: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("HN API returned %d", resp.StatusCode)
	}

	var ids []int
	if err := json.NewDecoder(resp.Body).Decode(&ids); err != nil {
		return nil, fmt.Errorf("failed to decode ids: %w", err)
	}

	if len(ids) < limit {
		limit = len(ids)
	}
	return ids[:limit], nil
}

func (c *Client) FetchStoryDetails(id int) (models.HNStory, error) {
	url := fmt.Sprintf("%s/item/%d.json", c.BaseURL, id)
	resp, err := c.HTTPClient.Get(url)
	if err != nil {
		return models.HNStory{}, err
	}
	defer resp.Body.Close()

	var s models.HNStory
	if err := json.NewDecoder(resp.Body).Decode(&s); err != nil {
		return models.HNStory{}, err
	}
	return s, nil
}

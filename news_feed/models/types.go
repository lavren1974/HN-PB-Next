package models

type HNStory struct {
	ID          int    `json:"id"`
	Title       string `json:"title"`
	By          string `json:"by"`
	Score       int    `json:"score"`
	Time        int64  `json:"time"`
	URL         string `json:"url"`
	Descendants int    `json:"descendants"` // Comments count
	Type        string `json:"type"`
}

type PBListResponse struct {
	Page       int             `json:"page"`
	PerPage    int             `json:"perPage"`
	TotalItems int             `json:"totalItems"`
	Items      []PBRecordSmall `json:"items"`
}

type PBRecordSmall struct {
	ID string `json:"id"`
}

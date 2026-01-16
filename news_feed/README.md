# News Feed Service

This service periodically fetches the newest stories from Hacker News and synchronizes them to a PocketBase collection.

## Structure

The project is organized into the following packages:

- **`main.go`**: The entry point of the application. Orchestrates the background worker, managing the synchronization loop and worker pool.
- **`config/`**: Handles configuration loading from `config.json` and environment variables (`.env`).
- **`models/`**: Defines shared data structures (e.g., `HNStory`, `PBListResponse`).
- **`hackernews/`**: Contains logic for interacting with the Hacker News API.
- **`pocketbase/`**: Encapsulates all PocketBase API interactions, including authentication, CRUD operations, and cleanup.

## Configuration

### Environment Variables (.env)
- `POCKETBASE_URL`: The URL of your PocketBase instance (default: `http://127.0.0.1:8090`).
- `PB_ADMIN_EMAIL`: Admin email for PocketBase authentication.
- `PB_ADMIN_PASSWORD`: Admin password for PocketBase authentication.

### Application Config (config.json)
- `update_interval_min_seconds`: Minimum time (in seconds) between syncs.
- `update_interval_max_seconds`: Maximum time (in seconds) between syncs.
- `stories_limit`: Number of top/new stories to fetch from HN in each cycle.
- `hn_api_url`: Base URL for the Hacker News API.
- `max_saved_stories`: Maximum number of stories to keep in PocketBase; older stories are automatically deleted.

## Usage

1.  Ensure PocketBase is running and the `news_feed` collection exists.
2.  Create a `.env` file with your credentials.
3.  Build and run:
    ```bash
    go build -o news_feed.exe
    ./news_feed.exe
    ```

## Development

- **Add Dependencies**: `go get <package>`
- **Run**: `go run main.go`

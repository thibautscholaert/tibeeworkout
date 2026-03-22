# Environment Variables Setup

## Required Environment Variables for Cron Job API

Add these environment variables to your Vercel project settings:

### GitHub Configuration
```bash
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # GitHub personal access token
GITHUB_REPO_OWNER=your-username                         # Repository owner
GITHUB_REPO_NAME=your-repo-name                         # Repository name
GITHUB_BRANCH=main                                      # Branch to update (optional, defaults to main)
```

### Cron Security
```bash
CRON_SECRET=your-secret-key-here                       # Secret for cron job authentication
```

### Existing Google Sheets Configuration (already required)
```bash
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
GOOGLE_SHEET_ID=your-google-sheet-id
```

## GitHub Token Setup

1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Generate a new token with `repo` scope
3. Add the token to your Vercel environment variables

## Cron Job Setup

Add this to your `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/sync",
      "schedule": "0 */6 * * *"
    }
  ]
}
```

This runs the sync every 6 hours. Adjust the schedule as needed.

**Note**: Vercel automatically adds the `Authorization: Bearer ${CRON_SECRET}` header to cron job requests.

## API Endpoint

- **URL**: `/api/cron/sync`
- **Method**: POST (for cron), GET (for testing)
- **Authentication**: `Authorization: Bearer ${CRON_SECRET}` header required
- **Response**: JSON with sync status and data summary

## Testing

For local testing, set the `CRON_SECRET` environment variable and include the authorization header:

```bash
curl -H "Authorization: Bearer your-secret-key" http://localhost:3000/api/cron/sync
```

## File Output

The API creates/updates:
- Local backup: `data/workout-sync.json`
- GitHub file: `data/workout-sync.json` in your repository

## Data Structure

The synced data includes:
- **History**: Last 20 workout sessions grouped by time
- **Programs**: All workout programs from Google Sheets
- **Profile**: User profile information
- **Metadata**: Last sync timestamp and success status

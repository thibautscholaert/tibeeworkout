# Workout tracker app

_Automatically synced with your [v0.app](https://v0.app) deployments_

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/thibauts-projects-4638000e/v0-workout-tracker-app)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/s7daVibag6s)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/thibauts-projects-4638000e/v0-workout-tracker-app](https://vercel.com/thibauts-projects-4638000e/v0-workout-tracker-app)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/s7daVibag6s](https://v0.app/chat/s7daVibag6s)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## API Endpoints

The application provides REST API endpoints to access workout data in JSON format:

### GET /api/history

Returns the complete workout history from Google Sheets.

**Response format:**

```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2026-02-11T10:30:00.000Z",
      "exerciseName": "Squat",
      "weight": 100,
      "reps": 10,
      "oneRM": 133.33
    }
  ]
}
```

### GET /api/programs

Returns all workout programs with their sessions, blocs, and exercises. Programs are organized by sessions (which include the associated day).

**Response format:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Program Name",
      "sessions": [
        {
          "session": "Session A",
          "day": "Monday",
          "blocs": [
            {
              "name": "Warm-up",
              "exercises": [
                {
                  "exerciseName": "Squat",
                  "sets": 3,
                  "reps": "10",
                  "charge": "60kg",
                  "recovery": "2min",
                  "notes": "Focus on form"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### GET /api/data

Returns both history and programs in a single request.

**Response format:**

```json
{
  "success": true,
  "data": {
    "history": [...],
    "programs": [...]
  }
}
```

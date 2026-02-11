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

The application provides REST API endpoints to access workout data in JSON format.

### Base URL

- Development: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`

---

### 1. GET /api/data

Récupère l'historique des séances et les programmes d'entraînement en une seule requête.

**Response:**

```json
{
  "success": true,
  "data": {
    "history": [
      {
        "sessionKey": "Mon Feb 09 2026",
        "sets": [
          {
            "timestamp": "2026-02-09T11:26:43.896Z",
            "exerciseName": "Muscle up",
            "weight": 0,
            "reps": 3,
            "oneRM": 50
          }
        ]
      }
    ],
    "programs": [
      {
        "id": "uuid",
        "title": "Force & Callisthénie v1",
        "sessions": [...]
      }
    ]
  }
}
```

**Notes:**

- `history`: Array des 10 dernières sessions d'entraînement
- Chaque session groupe les sets effectués dans une fenêtre de 2 heures
- `sessionKey`: Date de la session (format: "Day Month DD YYYY")
- `sets`: Array des exercices effectués pendant la session
- `oneRM`: 1RM estimé (One Rep Max) - présent uniquement pour les exercices avec charge

---

### 2. GET /api/history

Récupère uniquement l'historique des séances d'entraînement.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "sessionKey": "Mon Feb 09 2026",
      "sets": [
        {
          "timestamp": "2026-02-09T11:26:43.896Z",
          "exerciseName": "Muscle up",
          "weight": 0,
          "reps": 3
        }
      ]
    }
  ]
}
```

**Notes:**

- Limité aux 10 sessions les plus récentes
- Sessions triées par date décroissante (plus récentes en premier)
- Groupement automatique des sets par session (fenêtre de 2h)

---

### 3. GET /api/programs

Récupère la liste des programmes d'entraînement.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Force & Callisthénie v1",
      "sessions": [
        {
          "session": "Salle pull",
          "day": "LUNDI",
          "blocs": [
            {
              "name": "Skill",
              "exercises": [
                {
                  "exerciseName": "Muscle up",
                  "sets": 2,
                  "reps": "3",
                  "charge": "Qualité / Transition",
                  "recovery": "3'",
                  "notes": "Focus False Grip & Transition rapide"
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

**Structure d'un programme:**

- `id`: Identifiant unique du programme
- `title`: Nom du programme
- `sessions`: Array des séances du programme
  - `session`: Nom de la séance
  - `day`: Jour recommandé (ou "ANY" pour flexible)
  - `blocs`: Groupes d'exercices
    - `name`: Type de bloc (Skill, Lourd, Volume, Core, etc.)
    - `exercises`: Array des exercices du bloc
      - `exerciseName`: Nom de l'exercice
      - `sets`: Nombre de séries
      - `reps`: Nombre de répétitions (peut être range: "5-8")
      - `charge`: Indication de charge/poids
      - `recovery`: Temps de récupération
      - `notes`: Instructions spécifiques

---

## Concepts clés

### Session

Une session regroupe tous les sets effectués dans une fenêtre de 2 heures. Si un set est effectué plus de 2 heures après le dernier set d'une session, une nouvelle session est créée.

### 1RM (One Rep Max)

Le 1RM estimé est calculé automatiquement pour les exercices avec charge selon la formule de Brzycki:

- Si reps = 1: 1RM = poids
- Si reps > 12: 1RM = poids × (1 + reps / 30)
- Sinon: 1RM = poids × (36 / (37 - reps))

### Types d'exercices

- **Bodyweight (PDC)**: weight = 0
- **Weighted**: weight > 0

---

## Gestion des erreurs

En cas d'erreur, l'API retourne:

```json
{
  "success": false,
  "error": "Message d'erreur descriptif"
}
```

**Codes HTTP:**

- `200`: Succès
- `500`: Erreur serveur

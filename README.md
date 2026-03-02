# OTB Chess Analyzer

A React Native (Expo) iOS app that photographs over-the-board chess positions and provides Stockfish analysis.

## Features

- **Camera Capture**: Take photos of chess boards or pick from gallery
- **Automatic Board Detection**: ML-powered board recognition using chesscog (PyTorch)
- **Manual FEN Input**: Enter or edit chess positions using FEN notation
- **Stockfish Analysis** via Chess-API.com:
  - Position evaluation (pawns or mate-in-X)
  - Best move recommendation with board highlight
  - Principal variation (suggested line of play)
  - Win probability
- **Interactive Chess Board**: Visual board with highlighted best moves
- **Lichess Integration**: Open any position directly in Lichess for deeper analysis

## Architecture

```
┌─────────────────────┐
│   iOS App           │
│   (React Native /   │
│    Expo)            │
└─────────┬───────────┘
          │ HTTP (base64 image / FEN)
          ▼
┌─────────────────────┐         ┌──────────────────────────┐
│   Main Backend      │────────▶│   Chesscog Service       │
│   FastAPI :8000     │         │   FastAPI :8001           │
│   (backend/)        │         │   (chesscog-service/)    │
└─────────┬───────────┘         │   Hosted on Fly.io       │
          │                     └──────────────────────────┘
          ▼
    Chess-API.com
    (Stockfish engine)
```

## Project Structure

```
OTB-chess-analyzer/
├── frontend/                 # React Native Expo app
│   └── src/
│       ├── screens/
│       │   ├── HomeScreen.tsx
│       │   ├── CameraScreen.tsx
│       │   ├── AnalysisScreen.tsx
│       │   └── ManualFenScreen.tsx
│       ├── components/       # ChessBoard, EvaluationBar
│       ├── services/         # api.ts - HTTP client
│       └── types/            # TypeScript types
├── backend/                  # Main API server
│   ├── main.py               # FastAPI endpoints
│   ├── requirements.txt
│   └── Dockerfile
├── chesscog-service/         # Board detection microservice
│   ├── api.py                # FastAPI wrapper around chesscog
│   ├── chesscog/             # ML library (PyTorch)
│   ├── models/               # Downloaded ML models (git-ignored)
│   ├── Dockerfile.api        # Production Docker image
│   └── fly.toml              # Fly.io deployment config
├── docker-compose.yml        # Local development orchestration
├── setup.sh                  # First-time setup script
└── start-dev.sh              # Development startup script
```

## Getting Started (Local Development)

### Prerequisites

- Python 3.9+
- Node.js 18+
- npm
- Docker (optional, for containerized setup)

### Option A: Script Setup

```bash
# First time only — creates virtualenvs, installs deps, downloads ML models
./setup.sh

# Start both backend services
./start-dev.sh

# In a separate terminal, start the Expo dev server
cd frontend && npx expo start
```

### Option B: Docker Compose

```bash
docker-compose up --build
```

### Services

| Service | URL |
|---------|-----|
| Main Backend | http://localhost:8000 |
| Chesscog Detection | http://localhost:8001 |
| API Docs (backend) | http://localhost:8000/docs |
| API Docs (chesscog) | http://localhost:8001/docs |
| Expo Dev Server | http://localhost:8081 |

### Running on Device

- Press `i` — iOS Simulator
- Press `a` — Android Emulator
- Scan the QR code with Expo Go on a physical device

## Usage

1. **Home Screen**: Choose between camera capture or manual FEN entry

2. **Camera Screen**:
   - Align the chess board within the guide frame
   - Tap the shutter button, or tap Gallery to pick an existing photo
   - Review the captured image, then tap Analyze

3. **Analysis Screen**:
   - Chesscog automatically detects the board position from the photo
   - View the FEN, edit it if the detection is off
   - See evaluation, best move, win chance, and principal variation
   - Tap "Open in Lichess Board" for deeper analysis

4. **Manual FEN Entry**:
   - Type a FEN string directly
   - Validate and analyze the position

## API Endpoints

### Main Backend (port 8000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Service info |
| `/health` | GET | Health check |
| `/detect` | POST | Proxy image detection to chesscog |
| `/analyze` | POST | Analyze FEN with Stockfish via Chess-API.com |

**Detect request body:**
```json
{ "image": "<base64>", "turn": "white" }
```

**Analyze request body:**
```json
{ "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", "depth": 12 }
```

### Chesscog Service (port 8001)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Service info |
| `/health` | GET | Health check + model load status |
| `/detect` | POST | Detect board from file upload |
| `/detect/base64` | POST | Detect board from base64 image |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native 0.74, Expo 51 |
| Navigation | React Navigation v6 |
| Chess logic | chess.js 1.4 |
| Backend | Python 3.9, FastAPI, uvicorn, httpx |
| Board detection | chesscog (PyTorch ML model) |
| Analysis engine | Stockfish via Chess-API.com |
| Containerization | Docker, Docker Compose |

## Deployment

### Chesscog Service — Fly.io

The chesscog ML service is deployed separately on Fly.io due to its memory requirements (~2GB RAM for PyTorch).

```bash
cd chesscog-service
fly launch --no-deploy   # first time only
fly deploy
```

After deploying, update the backend's `CHESSCOG_SERVICE_URL` environment variable to the Fly.io URL (e.g. `https://chesscog-service.fly.dev`).

### Main Backend

Deploy to any Python host (Railway, Fly.io, Render, etc.) with the following environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `CHESS_API_URL` | `https://chess-api.com/v1` | Stockfish API endpoint |
| `CHESSCOG_SERVICE_URL` | `http://localhost:8001` | Chesscog service URL |

```bash
cd backend
docker build -t otb-backend .
docker run -p 8000:8000 \
  -e CHESSCOG_SERVICE_URL=https://chesscog-service.fly.dev \
  otb-backend
```

## Future Enhancements

- [ ] Game recording and history
- [ ] PGN export
- [ ] Multiple analysis lines
- [ ] Offline analysis capability
- [ ] Fine-tune chesscog model for better OTB accuracy
- [ ] Support for board orientation detection (white/black perspective)

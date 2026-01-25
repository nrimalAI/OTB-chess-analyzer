# OTB Chess Analyzer

A React Native mobile application that photographs over-the-board chess positions and provides Stockfish analysis.

## Features

- **Camera Capture**: Take photos of chess boards directly from the app
- **Automatic Board Detection**: ML-powered chess board recognition using chesscog
- **Manual FEN Input**: Enter chess positions manually using FEN notation
- **Stockfish Analysis**: Get instant analysis including:
  - Position evaluation (in pawns or mate-in-X)
  - Best move recommendation
  - Principal variation (suggested line of play)
  - Win probability
- **Interactive Chess Board**: Visual representation of the position with highlighted best moves
- **Lichess Integration**: Open any position directly in Lichess for deeper analysis

## Architecture

```
┌─────────────────────┐
│   Mobile App        │
│   (React Native)    │
└─────────┬───────────┘
          │ HTTP
          ▼
┌─────────────────────┐         ┌─────────────────────┐
│   Main Backend      │────────▶│   Chesscog Service  │
│   (Port 8000)       │         │   (Port 8001)       │
└─────────┬───────────┘         └─────────────────────┘
          │
          ▼
    Chess-API.com
    (Stockfish)
```

## Project Structure

```
OTB-chess-analyzer/
├── frontend/                 # React Native mobile app
│   └── src/
│       ├── screens/          # App screens
│       ├── components/       # Reusable components
│       ├── services/         # API client
│       └── types/            # TypeScript types
├── backend/                  # Main API server
│   └── main.py               # FastAPI endpoints
├── chesscog-service/         # Board detection microservice
│   ├── api.py                # FastAPI wrapper
│   ├── chesscog/             # ML library
│   └── models/               # Downloaded ML models
├── docker-compose.yml        # Container deployment
├── setup.sh                  # First-time setup script
└── start-dev.sh              # Development startup script
```

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- npm

### Setup & Run

```bash
# First time setup (installs dependencies, downloads ML models)
./setup.sh

# Start backend services
./start-dev.sh

# In another terminal, start the mobile app
cd frontend && npx expo start
```

### Services

| Service | URL |
|---------|-----|
| Main Backend | http://localhost:8000 |
| Chesscog Detection | http://localhost:8001 |
| API Docs | http://localhost:8000/docs |

### Running on Device

- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan the QR code with Expo Go app on your physical device

## Usage

1. **Home Screen**: Choose between taking a photo or entering a FEN manually

2. **Camera Mode**:
   - Align the chess board within the guide frame
   - Take a photo or select from gallery
   - Review the captured image

3. **Analysis Screen**:
   - Enter/edit the FEN string to match the board position
   - View the analysis results including evaluation and best move
   - Tap "Open in Lichess Analysis" for more detailed analysis

4. **Manual FEN Entry**:
   - Type a FEN string directly
   - Use preset positions for common openings
   - Validate and analyze the position

## API Endpoints

### Main Backend (port 8000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/analyze` | POST | Analyze position with Stockfish |
| `/detect` | POST | Detect board from image |

### Chesscog Service (port 8001)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/detect` | POST | Detect board (file upload) |
| `/detect/base64` | POST | Detect board (base64 image) |

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Python FastAPI
- **Board Detection**: chesscog (PyTorch ML model)
- **Analysis**: Stockfish via Chess-API.com
- **Chess Logic**: chess.js library

## Deployment

### Docker Compose

```bash
docker-compose up --build
```

### Manual Deployment

Deploy each service separately:
- Main Backend: Any Python hosting (Heroku, Railway, etc.)
- Chesscog Service: Requires more RAM/CPU for ML inference

## Future Enhancements

- [ ] Game recording and history
- [ ] PGN export
- [ ] Multiple analysis lines
- [ ] Offline analysis capability
- [ ] Fine-tune chesscog model for better accuracy

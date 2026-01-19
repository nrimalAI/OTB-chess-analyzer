# OTB Chess Analyzer

A React Native mobile application that allows users to capture over-the-board chess positions and analyze them using the Lichess API.

## Features

- **Camera Capture**: Take photos of chess boards directly from the app
- **Image Gallery**: Select existing images from your device
- **Manual FEN Input**: Enter chess positions manually using FEN notation
- **Position Analysis**: Get instant analysis from Lichess including:
  - Position evaluation (in pawns or mate-in-X)
  - Best move recommendation
  - Principal variation (suggested line of play)
  - Opening name identification
- **Interactive Chess Board**: Visual representation of the position with highlighted best moves
- **Lichess Integration**: Open any position directly in Lichess for deeper analysis

## Project Structure

```
OTB-chess-analyzer/
├── frontend/           # React Native (Expo) application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   │   ├── ChessBoard.tsx
│   │   │   └── EvaluationBar.tsx
│   │   ├── screens/    # App screens
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── CameraScreen.tsx
│   │   │   ├── AnalysisScreen.tsx
│   │   │   └── ManualFenScreen.tsx
│   │   ├── services/   # API integrations
│   │   │   └── lichessApi.ts
│   │   └── types/      # TypeScript type definitions
│   │       └── index.ts
│   └── App.tsx
└── backend/            # Python backend (future)
```

## Getting Started

### Prerequisites

- Node.js (v20+ recommended)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (or physical device with Expo Go)

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npx expo start
   ```

4. Run on your device:
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

## Current Limitations

- **Automatic board detection is not yet implemented**: Users must manually enter the FEN notation after capturing an image. Future versions may include computer vision-based board recognition.

## Tech Stack

- **Frontend**: React Native with Expo
- **UI Components**: Custom components with React Native StyleSheet
- **Navigation**: React Navigation (Native Stack)
- **Chess Logic**: chess.js library
- **Analysis**: Lichess Cloud Evaluation API

## API Integration

The app uses the following Lichess APIs:
- **Cloud Evaluation**: `https://lichess.org/api/cloud-eval` - For position analysis
- **Opening Explorer**: `https://explorer.lichess.ovh/masters` - For opening identification

## Future Enhancements

- [ ] Automatic chess board detection using computer vision
- [ ] Python backend for image processing
- [ ] Game recording and history
- [ ] PGN export
- [ ] Multiple analysis lines
- [ ] Offline analysis capability

## License

MIT

"""
Chesscog Microservice API

A FastAPI wrapper that exposes the chesscog chess board recognition
as a simple REST API endpoint.
"""

import io
import base64
from typing import Optional
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np
from PIL import Image
import chess

app = FastAPI(title="Chesscog Detection Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global recognizer instance (loaded once on startup)
recognizer = None


class DetectionResponse(BaseModel):
    success: bool
    fen: Optional[str] = None
    board_fen: Optional[str] = None
    is_valid: bool = False
    error: Optional[str] = None
    lichess_url: Optional[str] = None


class Base64ImageRequest(BaseModel):
    image: str  # Base64 encoded image
    turn: str = "white"  # "white" or "black"


@app.on_event("startup")
async def load_model():
    """Load the chesscog model on startup."""
    global recognizer
    try:
        from chesscog.recognition import ChessRecognizer
        from chesscog.occupancy_classifier.download_model import ensure_model as ensure_occupancy
        from chesscog.piece_classifier.download_model import ensure_model as ensure_piece

        # Ensure models are downloaded
        ensure_occupancy(show_size=True)
        ensure_piece(show_size=True)

        # Initialize the recognizer
        recognizer = ChessRecognizer()
        print("Chesscog model loaded successfully!")
    except Exception as e:
        print(f"Warning: Could not load chesscog model: {e}")
        print("The service will return errors until the model is properly installed.")


@app.get("/")
async def root():
    return {"message": "Chesscog Detection Service", "status": "running"}


@app.get("/health")
async def health_check():
    global recognizer
    return {
        "status": "healthy",
        "model_loaded": recognizer is not None
    }


def process_image(image_data: bytes, turn: str = "white") -> DetectionResponse:
    """Process an image and return the detected chess position."""
    global recognizer

    if recognizer is None:
        return DetectionResponse(
            success=False,
            error="Model not loaded. Please ensure chesscog is properly installed."
        )

    try:
        # Load image from bytes
        image = Image.open(io.BytesIO(image_data))

        # Convert to RGB if necessary
        if image.mode != "RGB":
            image = image.convert("RGB")

        # Convert to numpy array
        img_array = np.array(image)

        # Determine turn color
        turn_color = chess.WHITE if turn.lower() == "white" else chess.BLACK

        # Run prediction
        board, corners = recognizer.predict(img_array, turn_color)

        # Get FEN
        board_fen = board.board_fen()
        full_fen = board.fen()

        # Check if position is valid
        is_valid = board.status() == chess.Status.VALID

        return DetectionResponse(
            success=True,
            fen=full_fen,
            board_fen=board_fen,
            is_valid=is_valid,
            lichess_url=f"https://lichess.org/editor/{board_fen}"
        )

    except Exception as e:
        return DetectionResponse(
            success=False,
            error=str(e)
        )


@app.post("/detect", response_model=DetectionResponse)
async def detect_from_upload(
    file: UploadFile = File(...),
    turn: str = Form(default="white")
):
    """
    Detect chess position from an uploaded image file.

    - **file**: Image file (JPEG, PNG)
    - **turn**: Whose perspective the image is from ("white" or "black")
    """
    try:
        contents = await file.read()
        return process_image(contents, turn)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/detect/base64", response_model=DetectionResponse)
async def detect_from_base64(request: Base64ImageRequest):
    """
    Detect chess position from a base64 encoded image.

    - **image**: Base64 encoded image string
    - **turn**: Whose perspective the image is from ("white" or "black")
    """
    try:
        # Remove data URL prefix if present
        image_data = request.image
        if "," in image_data:
            image_data = image_data.split(",")[1]

        # Decode base64
        image_bytes = base64.b64decode(image_data)
        return process_image(image_bytes, request.turn)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

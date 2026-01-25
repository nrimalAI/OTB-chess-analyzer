import os
from typing import Optional, List
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

app = FastAPI(title="OTB Chess Analyzer API")

# Allow CORS for mobile app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CHESS_API_URL = os.getenv("CHESS_API_URL", "https://chess-api.com/v1")
CHESSCOG_SERVICE_URL = os.getenv("CHESSCOG_SERVICE_URL", "http://localhost:8001")


class AnalysisRequest(BaseModel):
    fen: str
    depth: int = 12


class DetectionRequest(BaseModel):
    image: str  # Base64 encoded image
    turn: str = "white"


class DetectionResponse(BaseModel):
    success: bool
    fen: Optional[str] = None
    board_fen: Optional[str] = None
    is_valid: bool = False
    error: Optional[str] = None
    lichess_url: Optional[str] = None


class AnalysisResponse(BaseModel):
    fen: str
    evaluation: Optional[float]
    best_move: Optional[str]
    best_move_san: Optional[str]
    continuation: List[str]
    is_mate: bool
    mate_in: Optional[int]
    depth: Optional[int]
    win_chance: Optional[float]


@app.get("/")
async def root():
    return {"message": "OTB Chess Analyzer API", "status": "running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/detect", response_model=DetectionResponse)
async def detect_board(request: DetectionRequest):
    """
    Detect chess position from an image using the chesscog microservice.
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{CHESSCOG_SERVICE_URL}/detect/base64",
                json={
                    "image": request.image,
                    "turn": request.turn,
                },
                timeout=60.0,
            )
            response.raise_for_status()
            data = response.json()

        return DetectionResponse(
            success=data.get("success", False),
            fen=data.get("fen"),
            board_fen=data.get("board_fen"),
            is_valid=data.get("is_valid", False),
            error=data.get("error"),
            lichess_url=data.get("lichess_url"),
        )

    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Detection service error: {e.response.text}",
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Failed to connect to detection service: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}",
        )


@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_position(request: AnalysisRequest):
    """
    Analyze a chess position using Stockfish via Chess-API.com
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                CHESS_API_URL,
                json={
                    "fen": request.fen,
                    "depth": request.depth,
                },
                timeout=30.0,
            )
            response.raise_for_status()
            data = response.json()

        # Check if it's a mate position
        is_mate = data.get("mate") is not None
        evaluation = None if is_mate else data.get("eval")

        return AnalysisResponse(
            fen=request.fen,
            evaluation=evaluation,
            best_move=data.get("move"),
            best_move_san=data.get("san"),
            continuation=data.get("continuationArr", []),
            is_mate=is_mate,
            mate_in=data.get("mate"),
            depth=data.get("depth"),
            win_chance=data.get("winChance"),
        )

    except httpx.HTTPStatusError as e:
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"Chess API error: {e.response.text}",
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Failed to connect to Chess API: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}",
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)

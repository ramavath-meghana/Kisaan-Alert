from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import base64
import json
import logging
import re
from pathlib import Path
from pydantic import BaseModel, Field
from typing import Optional, List
import uuid
from datetime import datetime, timezone

from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
GEMINI_MODEL = "gemini-3-flash-preview"

app = FastAPI(title="Kisan Alert API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


# ---------- Models ----------
class AdvisoryRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    kind: str  # "image" | "text"
    input_summary: str
    diagnosis: str
    advisory_en: str
    advisory_te: str
    advisory_hi: str = ""
    severity: str
    crop: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class AskRequest(BaseModel):
    question: str
    language: str = "en"  # 'en' | 'te' | 'hi'


# ---------- Helpers ----------
SYSTEM_PROMPT = (
    "You are Kisan Alert, an expert Indian agricultural advisor helping small and marginal farmers. "
    "Given a crop photo and/or farmer question, produce a concise, practical advisory. "
    "You MUST respond ONLY with a strict JSON object with these exact keys: "
    "crop (string, best guess of the crop or 'Unknown'), "
    "diagnosis (string, 1-2 sentences describing the health issue or observation), "
    "severity (string, one of: 'Low', 'Medium', 'High'), "
    "advisory_en (string, 3-5 short actionable steps as one plain paragraph in simple English suitable for low-literacy farmers, no markdown), "
    "advisory_te (string, the same advisory translated into natural Telugu script), "
    "advisory_hi (string, the same advisory translated into natural Hindi script). "
    "Do not include any text outside the JSON. Do not use markdown fences."
)


def _parse_json_safely(text: str) -> dict:
    """Extract first JSON object from LLM response."""
    text = text.strip()
    # Strip markdown fences if any
    text = re.sub(r"^```(?:json)?", "", text).strip()
    text = re.sub(r"```$", "", text).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        m = re.search(r"\{.*\}", text, re.DOTALL)
        if m:
            return json.loads(m.group(0))
        raise


async def _run_gemini(user_text: str, image_bytes: Optional[bytes] = None, image_mime: Optional[str] = None) -> dict:
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY not configured")

    chat = LlmChat(
        api_key=GEMINI_API_KEY,
        session_id=str(uuid.uuid4()),
        system_message=SYSTEM_PROMPT,
    ).with_model("gemini", GEMINI_MODEL)

    file_contents = None
    if image_bytes:
        b64 = base64.b64encode(image_bytes).decode("utf-8")
        file_contents = [ImageContent(image_base64=b64)]

    msg = UserMessage(text=user_text, file_contents=file_contents) if file_contents else UserMessage(text=user_text)

    try:
        response_text = await chat.send_message(msg)
    except Exception as e:
        logger.exception("Gemini API call failed")
        raise HTTPException(status_code=502, detail=f"Gemini API error: {e}")

    if isinstance(response_text, dict):
        # some SDK versions return dict; extract text
        response_text = response_text.get("text") or json.dumps(response_text)

    try:
        parsed = _parse_json_safely(str(response_text))
    except Exception as e:
        logger.error(f"Failed to parse Gemini response: {response_text}")
        raise HTTPException(status_code=500, detail=f"Invalid AI response format: {e}")

    return {
        "crop": parsed.get("crop", "Unknown"),
        "diagnosis": parsed.get("diagnosis", ""),
        "severity": parsed.get("severity", "Medium"),
        "advisory_en": parsed.get("advisory_en", ""),
        "advisory_te": parsed.get("advisory_te", ""),
        "advisory_hi": parsed.get("advisory_hi", ""),
    }


async def _save_advisory(rec: AdvisoryRecord):
    await db.advisories.insert_one(rec.model_dump())


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"service": "Kisan Alert API", "status": "ok"}


@api_router.post("/diagnose")
async def diagnose_image(
    image: UploadFile = File(...),
    description: str = Form(""),
):
    if image.content_type not in ("image/jpeg", "image/png", "image/webp"):
        raise HTTPException(status_code=400, detail="Only JPEG/PNG/WEBP images are supported")

    contents = await image.read()
    if len(contents) > 8 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Image too large (max 8MB)")

    user_text = (
        "This is a photo of a farmer's crop from India. "
        "Analyze it for diseases, pests, nutrient deficiency or health issues. "
        f"Additional farmer note: {description or 'none'}"
    )
    result = await _run_gemini(user_text, image_bytes=contents, image_mime=image.content_type)

    rec = AdvisoryRecord(
        kind="image",
        input_summary=(description or "Crop photo analysis")[:200],
        diagnosis=result["diagnosis"],
        advisory_en=result["advisory_en"],
        advisory_te=result["advisory_te"],
        advisory_hi=result.get("advisory_hi", ""),
        severity=result["severity"],
        crop=result["crop"],
    )
    await _save_advisory(rec)
    return {"id": rec.id, **result, "created_at": rec.created_at}


@api_router.post("/ask")
async def ask_question(body: AskRequest):
    q = body.question.strip()
    if not q:
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    user_text = (
        f"Farmer's question (language={body.language}): {q}\n"
        "Give a practical advisory. If the question is not agriculture-related, "
        "politely say so in the diagnosis field."
    )
    result = await _run_gemini(user_text)

    rec = AdvisoryRecord(
        kind="text",
        input_summary=q[:200],
        diagnosis=result["diagnosis"],
        advisory_en=result["advisory_en"],
        advisory_te=result["advisory_te"],
        advisory_hi=result.get("advisory_hi", ""),
        severity=result["severity"],
        crop=result["crop"],
    )
    await _save_advisory(rec)
    return {"id": rec.id, **result, "created_at": rec.created_at}


@api_router.get("/stats")
async def get_stats():
    total = await db.advisories.count_documents({})
    # Aggregate top diseases (based on 'crop' + first word of diagnosis)
    pipeline = [
        {"$group": {"_id": "$crop", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5},
    ]
    top_crops_raw = await db.advisories.aggregate(pipeline).to_list(10)
    top_crops = [{"crop": (d["_id"] or "Unknown"), "count": d["count"]} for d in top_crops_raw]

    severity_pipeline = [
        {"$group": {"_id": "$severity", "count": {"$sum": 1}}},
    ]
    sev_raw = await db.advisories.aggregate(severity_pipeline).to_list(10)
    severity = {d["_id"] or "Unknown": d["count"] for d in sev_raw}

    recent_raw = await db.advisories.find({}, {"_id": 0}).sort("created_at", -1).limit(6).to_list(6)

    # Blend with sample baseline so demo dashboard is never empty
    sample_baseline = {
        "farmers_served_baseline": 12480,
        "districts_covered": 14,
        "languages_supported": 2,
        "top_issues_sample": [
            {"issue": "Leaf Blight (Rice)", "count": 2140},
            {"issue": "Yellow Rust (Wheat)", "count": 1680},
            {"issue": "Bollworm (Cotton)", "count": 1320},
            {"issue": "Nutrient Deficiency", "count": 980},
            {"issue": "Powdery Mildew", "count": 720},
        ],
    }

    return {
        "live": {
            "total_advisories": total,
            "top_crops": top_crops,
            "severity_breakdown": severity,
            "recent": recent_raw,
        },
        "sample": sample_baseline,
    }


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

  
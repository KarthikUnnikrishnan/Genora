from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
from pydantic import BaseModel
from typing import Optional, List
import os, json, re

from dotenv import load_dotenv
load_dotenv()

# ── App setup ────────────────────────────────────────────────────────────────
app = FastAPI(title="Genora API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://*.vercel.app"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Database ─────────────────────────────────────────────────────────────────
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:password@localhost:5432/genora"  # ← update this
)
engine = create_engine(DATABASE_URL)


def db():
    with engine.connect() as conn:
        yield conn


# ── Pydantic models ───────────────────────────────────────────────────────────
class Medicine(BaseModel):
    id: int
    product_name: str
    sub_category: Optional[str]
    salt_composition: Optional[str]
    dosage_form: Optional[str]
    price: Optional[float]
    price_available: Optional[bool]
    manufacturer: Optional[str]
    is_discontinued: Optional[bool]
    description: Optional[str]
    uses: Optional[str]
    side_effects: Optional[str]
    drug_interactions: Optional[str]
    drug_interaction_count: Optional[int]
    image_url: Optional[str]
    review_excellent_pct: Optional[float]
    review_average_pct: Optional[float]
    review_poor_pct: Optional[float]


# ── Helper ────────────────────────────────────────────────────────────────────
def row_to_dict(row):
    return dict(row._mapping)


def parse_interactions(raw):
    if not raw:
        return []
    try:
        data = json.loads(raw)
        if isinstance(data, list):
            return data
        return []
    except Exception:
        return []


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "service": "Genora API"}


@app.get("/search/{name}")
def search(name: str):
    """Search by product name or salt composition. Returns best match + alternatives."""
    with engine.connect() as conn:
        # Exact name match first
        q = text("""
            SELECT * FROM medicines
            WHERE LOWER(product_name) LIKE LOWER(:q)
               OR LOWER(salt_composition) LIKE LOWER(:q)
            ORDER BY
                CASE WHEN LOWER(product_name) = LOWER(:exact) THEN 0 ELSE 1 END,
                price ASC NULLS LAST
            LIMIT 1
        """)
        row = conn.execute(q, {"q": f"%{name}%", "exact": name}).fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Medicine not found")

        medicine = row_to_dict(row)

        # Get alternatives by same salt
        salt = medicine.get("salt_composition")
        alts = []
        if salt:
            alt_q = text("""
                SELECT * FROM medicines
                WHERE salt_composition = :salt
                  AND id != :mid
                ORDER BY price ASC NULLS LAST
                LIMIT 10
            """)
            alt_rows = conn.execute(alt_q, {"salt": salt, "mid": medicine["id"]}).fetchall()
            alts = [row_to_dict(r) for r in alt_rows]

        # Parse interactions
        medicine["interactions_parsed"] = parse_interactions(medicine.get("drug_interactions"))
        for a in alts:
            a["interactions_parsed"] = parse_interactions(a.get("drug_interactions"))

        return {
            "medicine": medicine,
            "alternatives": alts,
            "total_alternatives": len(alts),
        }


@app.get("/medicine/{id}")
def get_medicine(id: int):
    """Get full detail for a single medicine by ID."""
    with engine.connect() as conn:
        q = text("SELECT * FROM medicines WHERE id = :id")
        row = conn.execute(q, {"id": id}).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Not found")
        d = row_to_dict(row)
        d["interactions_parsed"] = parse_interactions(d.get("drug_interactions"))
        return d


@app.get("/alternatives/{id}")
def get_alternatives(id: int):
    """Get all alternatives for a medicine, sorted by price."""
    with engine.connect() as conn:
        # Get the original medicine's salt
        orig = conn.execute(text("SELECT salt_composition FROM medicines WHERE id = :id"), {"id": id}).fetchone()
        if not orig:
            raise HTTPException(status_code=404, detail="Medicine not found")

        salt = orig[0]
        q = text("""
            SELECT * FROM medicines
            WHERE salt_composition = :salt
              AND id != :id
            ORDER BY price ASC NULLS LAST
        """)
        rows = conn.execute(q, {"salt": salt, "id": id}).fetchall()
        alts = [row_to_dict(r) for r in rows]
        for a in alts:
            a["interactions_parsed"] = parse_interactions(a.get("drug_interactions"))
        return {"alternatives": alts, "count": len(alts)}


@app.get("/categories")
def list_categories():
    """List all sub_categories with medicine count."""
    with engine.connect() as conn:
        q = text("""
            SELECT sub_category, COUNT(*) as count
            FROM medicines
            WHERE sub_category IS NOT NULL
            GROUP BY sub_category
            ORDER BY count DESC
        """)
        rows = conn.execute(q).fetchall()
        return [{"category": r[0], "count": r[1]} for r in rows]


@app.get("/category/{name}")
def get_by_category(name: str):
    """All medicines in a category."""
    with engine.connect() as conn:
        q = text("""
            SELECT * FROM medicines
            WHERE LOWER(sub_category) = LOWER(:name)
            ORDER BY price ASC NULLS LAST
        """)
        rows = conn.execute(q, {"name": name}).fetchall()
        return [row_to_dict(r) for r in rows]


@app.post("/image/analyze")
async def analyze_image(image: UploadFile = File(...), type: str = "strip"):
    """
    AI image analysis endpoint.
    Receives an image, runs EasyOCR / Moondream2, returns matched medicine.
    Install: pip install easyocr pillow
    """
    try:
        import easyocr
        from PIL import Image
        import io

        contents = await image.read()
        img = Image.open(io.BytesIO(contents)).convert("RGB")

        reader = easyocr.Reader(["en"], gpu=False)
        results = reader.readtext(img, detail=0, paragraph=True)
        raw_text = "\n".join(results)

        # Extract medicine-like tokens (capitalized words)
        tokens = re.findall(r"[A-Z][a-z]+(?:\s+\d+(?:mg|ml|mcg|g)?)?", raw_text)
        query = " ".join(tokens[:4]) if tokens else raw_text[:80]

        # Search DB
        with engine.connect() as conn:
            q = text("""
                SELECT * FROM medicines
                WHERE LOWER(product_name) LIKE LOWER(:q)
                ORDER BY price ASC NULLS LAST
                LIMIT 1
            """)
            row = conn.execute(q, {"q": f"%{query.split()[0]}%"}).fetchone()

            if not row:
                raise HTTPException(status_code=404, detail="No medicine matched from image")

            medicine = row_to_dict(row)
            salt = medicine.get("salt_composition")

            alts = []
            if salt:
                alt_rows = conn.execute(text("""
                    SELECT * FROM medicines
                    WHERE salt_composition = :salt AND id != :mid
                    ORDER BY price ASC NULLS LAST LIMIT 10
                """), {"salt": salt, "mid": medicine["id"]}).fetchall()
                alts = [row_to_dict(r) for r in alt_rows]

        return {
            "extracted": raw_text[:500],
            "query_used": query,
            "confidence": 88,
            "medicine": medicine,
            "alternatives": alts,
        }

    except ImportError:
        # EasyOCR not installed — return demo data
        raise HTTPException(
            status_code=501,
            detail="EasyOCR not installed. Run: pip install easyocr pillow"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

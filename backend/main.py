from fastapi import FastAPI, File, UploadFile, HTTPException, Form
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
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Database ─────────────────────────────────────────────────────────────────
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:password@localhost:5432/genora"
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


# Words to skip when searching OCR output
SKIP_WORDS = {
    "COMPOSITION", "TABLET", "TABLETS", "CAPSULES", "SYRUP",
    "HYDROCHLORIDE", "CONTAINS", "PHYSICIAN", "DIRECTED",
    "TEMPERATURE", "SCHEDULE", "PRESCRIPTION", "COLOURS",
    "TITANIUM", "DIOXIDE", "QUINOLINE", "YELLOW", "DOSAGE",
    "STORE", "PROTECTED", "MOISTURE", "EXCEEDING", "CHILDREN",
    "EACH", "FILM", "COATED", "USES", "SIDE", "EFFECTS",
    "WARNINGS", "STORAGE", "MANUFACTURED", "DISTRIBUTED",
    "BATCH", "EXPIRY", "DATE", "KEEP", "REACH", "SHAKE",
    "WELL", "BEFORE", "INJECT", "ONLY", "STERILE", "SINGLE",
}


def search_medicine_in_db(conn, words):
    """Try each word against the DB and return first match."""
    for w in words:
        if w.upper() in SKIP_WORDS or len(w) < 4:
            continue
        q = text("""
            SELECT * FROM medicines
            WHERE LOWER(product_name) LIKE LOWER(:q)
               OR LOWER(salt_composition) LIKE LOWER(:q)
            ORDER BY
                CASE WHEN LOWER(product_name) = LOWER(:exact) THEN 0 ELSE 1 END,
                LENGTH(salt_composition) ASC,
                price ASC NULLS LAST
            LIMIT 1
        """)
        row = conn.execute(q, {"q": f"%{w}%", "exact": w}).fetchone()
        if row:
            return row_to_dict(row), w
    return None, ""


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "service": "Genora API"}


@app.get("/autocomplete/{query}")
def autocomplete(query: str):
    """Return up to 8 medicine name suggestions as user types."""
    if len(query) < 2:
        return {"suggestions": []}
    with engine.connect() as conn:
        q = text("""
            SELECT product_name, salt_composition, MIN(price)
            FROM medicines
            WHERE LOWER(product_name) LIKE LOWER(:q)
            GROUP BY product_name, salt_composition
            ORDER BY
                CASE WHEN LOWER(product_name) LIKE LOWER(:starts)
                THEN 0 ELSE 1 END,
                LENGTH(product_name) ASC
            LIMIT 8
        """)
        rows = conn.execute(q, {
            "q": f"%{query}%",
            "starts": f"{query}%"
        }).fetchall()
        return {
            "suggestions": [
                {
                    "name": r[0],
                    "salt": r[1] or "",
                    "price": f"₹{float(r[2]):.2f}" if r[2] else "N/A"
                }
                for r in rows
            ]
        }


@app.get("/search/{name}")
def search(name: str):
    with engine.connect() as conn:
        q = text("""
            SELECT * FROM medicines
            WHERE LOWER(product_name) LIKE LOWER(:q)
               OR LOWER(salt_composition) LIKE LOWER(:q)
            ORDER BY
                CASE WHEN LOWER(product_name) = LOWER(:exact) THEN 0 ELSE 1 END,
                CASE WHEN LOWER(salt_composition) LIKE LOWER(:salt_exact) THEN 0 ELSE 1 END,
                LENGTH(salt_composition) ASC,
                price ASC NULLS LAST
            LIMIT 1
        """)
        row = conn.execute(q, {
            "q": f"%{name.strip().replace(' ', '%')}%",
            "exact": name,
            "salt_exact": f"%{name.strip().replace(' ', '%')}%"
        }).fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Medicine not found")

        medicine = row_to_dict(row)
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
            alt_rows = conn.execute(alt_q, {
                "salt": salt,
                "mid": medicine["id"]
            }).fetchall()
            alts = [row_to_dict(r) for r in alt_rows]

        medicine["interactions_parsed"] = parse_interactions(
            medicine.get("drug_interactions"))
        for a in alts:
            a["interactions_parsed"] = parse_interactions(
                a.get("drug_interactions"))

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
        orig = conn.execute(
            text("SELECT salt_composition FROM medicines WHERE id = :id"),
            {"id": id}
        ).fetchone()
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
async def analyze_image(image: UploadFile = File(...), type: str = Form("strip")):
    """
    Image scan using Tesseract OCR — lightweight, works on free tier.
    """
    try:
        import pytesseract
        from PIL import Image, ImageFilter, ImageEnhance
        import io

        contents = await image.read()
        img = Image.open(io.BytesIO(contents)).convert("RGB")

        # ── Pre-process for better OCR accuracy ──────────────────────────────
        # Resize if too small
        w, h = img.size
        if w < 1000:
            scale = 1000 / w
            img = img.resize((int(w * scale), int(h * scale)), Image.LANCZOS)

        # Convert to grayscale
        gray = img.convert("L")

        # Increase contrast
        enhancer = ImageEnhance.Contrast(gray)
        gray = enhancer.enhance(2.0)

        # Sharpen
        gray = gray.filter(ImageFilter.SHARPEN)

        # ── Run Tesseract ─────────────────────────────────────────────────────
        # PSM 6 = assume uniform block of text (good for medicine strips)
        custom_config = r"--oem 3 --psm 6"
        raw_text = pytesseract.image_to_string(gray, config=custom_config)

        if not raw_text.strip():
            # Try PSM 11 (sparse text) as fallback
            raw_text = pytesseract.image_to_string(gray, config=r"--oem 3 --psm 11")

        # ── Extract candidate words ───────────────────────────────────────────
        words = re.findall(r"[A-Za-z][A-Za-z0-9\-]{3,}", raw_text)
        # Sort longest first — more specific = more likely to be medicine name
        words = sorted(set(words), key=len, reverse=True)

        # ── Search database ───────────────────────────────────────────────────
        with engine.connect() as conn:
            medicine, used_query = search_medicine_in_db(conn, words)

            if not medicine:
                raise HTTPException(
                    status_code=404,
                    detail=f"No medicine matched. OCR read: {raw_text[:200]}"
                )

            salt = medicine.get("salt_composition")
            alts = []
            if salt:
                alt_rows = conn.execute(text("""
                    SELECT * FROM medicines
                    WHERE salt_composition = :salt AND id != :mid
                    ORDER BY price ASC NULLS LAST LIMIT 10
                """), {"salt": salt, "mid": medicine["id"]}).fetchall()
                alts = [row_to_dict(r) for r in alt_rows]

            medicine["interactions_parsed"] = parse_interactions(
                medicine.get("drug_interactions"))
            for a in alts:
                a["interactions_parsed"] = parse_interactions(
                    a.get("drug_interactions"))

        return {
            "extracted": raw_text[:500],
            "query_used": used_query,
            "confidence": 85,
            "medicine": medicine,
            "alternatives": alts,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
